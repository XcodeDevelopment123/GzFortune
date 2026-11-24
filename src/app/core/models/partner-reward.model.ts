// Contracts of our backend's /PartnerRewards endpoints (Warely Partner API behind our server).
// Decimal quantities arrive as strings ("50", "12.5"); they are parsed only for display/comparison —
// Warely remains the authority on balances and costs.

export type PartnerBenefitType = 'reward' | 'cash_voucher' | 'pass' | string;
export type PartnerAvailability = 'available' | 'used' | 'expired' | 'unavailable';

/** A definition that can be claimed (NOT an owned item). */
export interface PartnerOffer {
  rewardId: string;
  version: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  type: PartnerBenefitType;
  /** "0" for gift-only definitions. */
  pointsCost: string;
  /** definition.issue_method: points | either | gift */
  issueMethod?: string | null;
  /** points = claimable with points; gift = issued to members by the business (not claimable). */
  howToGet: 'points' | 'gift';
  value?: string | null;
  currency?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface PartnerPoints {
  /** Spendable points (available_balance). */
  available: string;
  balance: string;
  reserved: string;
  unit?: string | null;
  tier?: string | null;
}

export interface PartnerMemberOffers {
  points: PartnerPoints;
  offers: PartnerOffer[];
}

/** An issued wallet asset owned by this account. assetId ≠ rewardId. */
export interface PartnerWalletAsset {
  assetId: string;
  rewardId?: string | null;
  name: string;
  description?: string | null;
  type: PartnerBenefitType;
  status: string;
  availability: PartnerAvailability;
  isAvailable: boolean;
  currency?: string | null;
  remainingValue?: string | null;
  remainingUses?: number | null;
  partialUse?: boolean | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  imageUrl?: string | null;
}

export interface PartnerWallet {
  available: PartnerWalletAsset[];
  unavailable: PartnerWalletAsset[];
}

export interface PartnerClaimRequest {
  claimId: string;
  rewardId: string;
  version: number;
  confirmedPointsCost: string;
}

export interface PartnerClaimResult {
  claimId: string;
  asset: PartnerWalletAsset;
  points?: PartnerPoints | null;
  wallet?: PartnerWallet | null;
}

/** Sensitive: render only, never log, never put in URLs. */
export interface PartnerAssetCode {
  assetId: string;
  qrPayload: string;
  barcodePayload: string;
}

export interface PartnerMemberCode {
  qrPayload: string;
}

export interface PartnerApiError {
  status: number;
  code: string;
  message: string;
  retryable: boolean;
  traceId?: string | null;
  currentVersion?: number | null;
}

/** Normalises an HttpErrorResponse-like object from BaseApiService into a PartnerApiError. */
export function toPartnerError(err: any): PartnerApiError {
  const body = err?.error && typeof err.error === 'object' ? err.error : {};
  const status = typeof err?.status === 'number' ? err.status : 0;
  return {
    status,
    code: body.code ?? (status === 0 ? 'network_error' : `http_${status}`),
    message:
      body.message ??
      (status === 0
        ? 'No connection. Please check your internet and try again.'
        : 'Something went wrong. Please try again.'),
    // A dropped connection means the outcome is unknown: safe to retry with the SAME claimId.
    retryable: body.retryable ?? (status === 0 || status === 503 || status === 504),
    traceId: body.traceId ?? null,
    currentVersion: body.currentVersion ?? null,
  };
}

export function pointsNumber(value: string | null | undefined): number {
  const n = Number(value ?? '0');
  return Number.isFinite(n) ? n : 0;
}
