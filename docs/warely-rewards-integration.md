# Warely Partner API — Rewards, Vouchers and Points

Sources: *Warely Rewards Guide* v2.2.1 (2026-10-31) and the latest *WarelyPOS Next API* Postman collection
(folder **01 Partner API - Websites & Rewards Apps**). Postman responses are labelled *illustrative*; they show
field names and shapes, not results from our tenant. Staging must still be verified end to end.

The app talks only to **our backend**. Only the backend talks to Warely. The old Warely `/sp` API is no longer used
anywhere in the backend or the app.

## Architecture

```
GzFortune app ──(app JWT + X-Member-Session)──▶ LuckyPotAppApi ──(Bearer machine token, X-Warely-Contract: v-next)──▶ Warely Partner API
                                                    │                                                                 /api/partner/v1
                                                    └─ members / wallets / OTP tables (our member record)
Warely POS: scans member QR, then the benefit code, and consumes the benefit in the sale. The app never consumes.
```

* **Member accounts live in Warely.** Our backend sends and verifies OTPs and issues the app's member session;
  it does not create `members` rows any more.
  * Registration: `RequestRegisterOtpSms` → `VerifyRegisterOtp` returns a `RegistrationProof` (random, stored as a
    SHA-256 hash, bound to the phone, 10 minutes, single use) → `MemberRegister` with that proof. The backend stores a
    `PartnerCustomerMappings` row (unique `VerifiedPhone`, new opaque `ExternalId`, `Idempotency-Key`, exact body)
    **before** calling `PUT /customers/{externalId}` (`name`, `mobile` E.164, `email`, `date_of_birth`,
    `status: "active"`, `expected_version: null`, marketing e-mail consent only if ticked). A timeout returns 503 and the
    app retries with the same proof → same ID, key and body. A 409 identity conflict is refused, never auto-linked.
    The session is issued only after Warely confirms and `GET /customers/{externalId}` reads back `status: active`.
    A stored-value `wallets` row and the welcome notification are still created (app data used by checkout/top-up).
  * Login: `MemberLogin` → `VerifyLoginOtp`. After the OTP is verified the backend resolves the mapping by phone,
    calls `GET /customers/{externalId}`, requires `status: active`, then issues the session. Existing members (with a
    `members` row) reuse their mapping; one without a mapping is linked once from the OTP-verified phone and their
    local profile (Warely conflict → refused).
  * Session (`X-Member-Session`, audience `gzfortune-member`): claims `gzf_external_id`, `gzf_phone`,
    `token_use=member_session`. Profile, points, rewards, wallet and codes are resolved from that externalId.
* **Machine token.** `POST /api/partner/v1/oauth/token`, `application/x-www-form-urlencoded`,
  `grant_type=client_credentials&client_id=…&client_secret=…`. Cached in memory until `received_at + expires_in`
  (the returned value, not a constant), renewed when fewer than 30 s remain, one renewal at a time, renewed once after a 401.
  The client secret and token never leave the server and are never logged.

## Backend endpoints used by the app

| App endpoint (ours) | Auth | Warely call(s) | Notes |
|---|---|---|---|
| `GET /api/PartnerRewards/offers` | none (guest) | `GET /rewards` (offers.read) | Managed catalogue filtered to **available offers**: `status=active`, audience `all_members`, inside `starts_at`/`ends_at` (end exclusive), no tier restriction, type reward / cash_voucher / pass, optional outlet and merchant allow-list. Includes gift-only vouchers (`howToGet: "gift"`, not claimable) and points offers (`howToGet: "points"`). Cached 60 s. |
| `GET /api/PartnerRewards/me/offers` | member session | `GET /customers/{id}/rewards` + `GET /customers/{id}/loyalty` | Claimable definitions (`reward_id`, `version`, `definition.points_cost`) and spendable points (`balance.accounts[asset_type=points].available_balance`). |
| `GET /api/PartnerRewards/me/points` | member session | `GET /customers/{id}/loyalty` (loyalty.read) | `available`, `balance`, `reserved`, `tier` (`balance.membership.name`). |
| `POST /api/PartnerRewards/me/claims` | member session | `POST /customers/{id}/rewards/{rewardId}/issue` (tickets.write + claims.write, + cash_vouchers.write for cash vouchers) | See *Claim with points*. Then re-reads `/loyalty` and `/wallet`. |
| `GET /api/PartnerRewards/me/wallet` | member session | `GET /customers/{id}/wallet?afterId=…` (tickets.read) | **My Vouchers**: owned assets only, split into `available` and `unavailable` (used / expired / other). No QR payloads in this response. |
| `GET /api/PartnerRewards/me/wallet/{assetId}/code` | member session | wallet read, then `GET /customers/{id}/wallet/{assetId}/code` | Only for an asset in this member's wallet that is available. `assetId` is the wallet asset UUID, never `reward_id`. `Cache-Control: no-store`. |
| `GET /api/PartnerRewards/me/member-code` | member session | `GET /customers/{id}/member-code` | Member QR, scanned first. `no-store`. |
| `GET /api/PartnerRewards/me/wallet/history` | member session | `GET /customers/{id}/wallet/history?afterId=…` | Issued / redeemed / refunded activity. |
| `POST /api/MemberDetails/GetMemberDetails` | member session | `GET /customers/{id}/loyalty` (best effort) | Profile from `members`, stored-value balance from our `wallets`, points/tier from Warely. Body is ignored. |
| `POST /api/MemberWallet/MemberGetWalletDetails` | member session | `GET /customers/{id}/loyalty` (best effort) | Same sources as above. Body is ignored. |

All Partner requests send `Authorization: Bearer <token>`, `Accept: application/json`, `X-Warely-Contract: v-next`,
`X-App-Version`, `X-Device-Id` (backend installation id) and, for JSON writes, `Content-Type: application/json`.

### Claim with points

1. The Points tab shows the claimable offer and its exact `pointsCost`; the member must confirm in a dialog.
2. The app creates **one UUID per intended claim**, stores it (Capacitor Preferences) and sends
   `{ claimId, rewardId, version, confirmedPointsCost }`. The button is disabled while a claim is pending.
3. The backend validates the offer against the latest claimable list (same `version`, same cost), stores a
   `PartnerRewardClaims` row (`OperationId` = claimId, `MemberId`, `ExternalId`, `RewardId`, `ExpectedVersion`) **before**
   the first request, then sends:

   ```http
   POST /api/partner/v1/customers/{externalId}/rewards/{rewardId}/issue
   Idempotency-Key: <claimId>
   Content-Type: application/json

   {"op_id":"<claimId>","issue_method":"points","expected_version":<version>}
   ```

   `issue_method` is always `points` from this path; gift issuance is not exposed.
4. Timeout / network error / 429 / 5xx / `operation_in_progress` → one immediate replay with the same key and body; if still
   unknown the app gets `503 claim_outcome_unknown` (`retryable: true`) and retries with the **same** claimId. A replayed
   claimId must belong to the same member, reward and version (also after a concurrent insert), otherwise
   `409 claim_id_reused` and nothing is sent to Warely.
5. Success (HTTP 200, one wallet asset) → row `Succeeded` with `asset_id`; backend re-reads `/loyalty` and `/wallet`;
   the app opens **My Vouchers** with the new asset highlighted.
6. Definitive failures are returned as non-2xx: `409 insufficient_points`, `409 reward_unavailable`,
   `409 offer_version_conflict` (re-review), `422 cash_voucher_cap_exceeded`, etc. No asset is shown and points are not
   deducted by Warely.

### Wallet, codes and the counter

* Paging (guide 13.4): start `afterId=0`, continue with the last item's `cursor`, stop on an empty page; de-duplicate by
  `asset_id` / history `id`. The backend also stops if a cursor does not advance.
* Availability: `status`, `expires_at` (exclusive), `remaining_uses`, and `remaining_value` for cash vouchers. Only an
  `active` asset with uses/value left and not expired shows codes; POS makes the final basket decision.
* Detail screen: **Step 1** member QR (`member-code`), **Step 2** asset QR (`qr_payload`) and Code 128 (`barcode_payload`).
  Payloads are never put in URLs, logs or analytics and are cleared when leaving the page.
* After a POS sale the member pulls to refresh (or reopens the tab); points and wallet are re-read from Warely.

### Errors

Partner errors are Problem Details (`type`, `title`, `status`, `code`, `trace_id`, optional `detail`/`errors`).
`trace_id` and `code` are logged; bodies are not. Our responses carry `{ code, message, retryable, traceId }`.
Our credential/scope/mapping problems (401 after renewal, 403, `partner_customer_not_found`) surface as 502 to the app.

## Configuration

```jsonc
"WarelyPartner": {
  "BaseUrl": "https://api-stage.warely.ai",   // production URL comes from Warely at go-live
  "ClientId": "", "ClientSecret": "",          // set via user-secrets / environment, never in git
  "GuestCatalogue": { "AllowedAudiences": ["all_members"], "AllowedTypes": ["reward","cash_voucher","pass"],
                      "AllowedIssueMethods": ["points","either","gift"], "ApprovedRewardIds": [],
                      "RequireApprovedList": false, "AllowedLocationIds": [], "HideTierRestricted": true, "CacheSeconds": 60 }
},
"MemberSession": { "SigningKey": "", "LifetimeDays": 90 }
```

```bash
dotnet user-secrets set "WarelyPartner:ClientId" "<client id>"
dotnet user-secrets set "WarelyPartner:ClientSecret" "<client secret>"
dotnet user-secrets set "MemberSession:SigningKey" "<32+ random bytes>"
```

There is no on/off switch and no fallback. With missing credentials the API logs
`Warely Partner API is not configured (missing …)` at startup and the reward endpoints return `503 partner_not_configured`.

Database: apply migrations `AddWarelyPartnerRewards`, `PartnerMappingsByMemberId` and `WarelyMemberIdentity`
(`dotnet ef database update`). The last one adds the identity columns (`VerifiedPhone`, `AppUserId`,
`DeactivatedAtUtc`, `RegistrationProofId`), the `RegistrationProofs` table, keys claims by `ExternalId`, and
back-fills `VerifiedPhone`/`AppUserId` for existing mappings from `members`.

## Contract gaps (no Partner equivalent)

* Warely has no password, photo or referral code. New members sign in with OTP only; the e-mail/password login and
  referral codes keep working only for members with a legacy `members` row. Profile photos are not stored for new members.
* Stored-value wallet balance and top-ups: no Partner endpoint; the balance shown is our local `wallets` table.
* Points ledger (earned/spent history): no Partner endpoint. `/wallet/history` covers benefit activity and
  `/purchases` (sales.read) covers POS purchases; neither is wired into the app yet.
* Guest visibility: `GET /rewards` has no "public" flag. Guests see active, all-member, in-date definitions; the merchant
  can narrow this with `ApprovedRewardIds` / `RequireApprovedList` / `AllowedLocationIds`.
* Asset `status` values other than `active` are not enumerated in the collection; anything else is treated as unavailable.
* Webhooks (`reward.wallet.*`, `loyalty.points.changed`) are not implemented; screens refresh on open / pull.
* Paid voucher sales on a website: verify payment in our own system, then `issue` (guide 12.2). Not part of the app.
