import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { preferenceKeys } from 'src/app/shared/statics/constants';
import { KeepLoginUserRequest } from '../repo/request/user-request.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Member } from '../models/member.model';
import { Wallet } from 'src/app/core/models/wallet.model';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private _memberInfo = new BehaviorSubject<Member | null>(null);

  // ✅ wallet 允许为 null
  private _walletInfo = new BehaviorSubject<Wallet | null>(null);

  // ✅ 新增：wallet loading 状态
  private _walletLoading = new BehaviorSubject<boolean>(false);
  walletLoading$ = this._walletLoading.asObservable();

  private pointSubject = new BehaviorSubject<number | null>(null);
  point$ = this.pointSubject.asObservable();

  constructor() {}

  setPoint(point: number) {
    this.pointSubject.next(point);
  }

  setWalletLoading(isLoading: boolean) {
    this._walletLoading.next(isLoading);
  }

  async getKeepLoginRequest(): Promise<KeepLoginUserRequest | null> {
    const { value } = await Preferences.get({ key: preferenceKeys.keep_login_user_req });
    if (!value) return null;
    return JSON.parse(value) as KeepLoginUserRequest;
  }

  async removeKeepLoginRequest(): Promise<void> {
    await Preferences.remove({ key: preferenceKeys.keep_login_user_req });
  }

  async setKeepLoginRequest(req: KeepLoginUserRequest): Promise<void> {
    await Preferences.set({ key: preferenceKeys.keep_login_user_req, value: JSON.stringify(req) });
    console.log('set', req);
  }

  get memberInfo() {
    return this._memberInfo.asObservable();
  }

  get walletInfo(): Observable<Wallet | null> {
    return this._walletInfo.asObservable();
  }

  updateMemberInfo(member: Member) {
    this._memberInfo.next(member);
  }

  removeMemberInfo() {
    this._memberInfo.next(null);
  }

  updateWalletInfo(wallet: Wallet | null) {
    this._walletInfo.next(wallet);
  }

  removeWalletInfo() {
    this._walletInfo.next(null);
  }
}
