import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { auth, preferenceKeys } from 'src/app/shared/statics/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  private memberSessionChangedSubject = new Subject<string | null>();
  /** Emits the new member session (or null) whenever it is set, removed or cleared by logout. */
  public memberSessionChanged$: Observable<string | null> = this.memberSessionChangedSubject.asObservable();

  constructor() {}

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  setAuthenticated(status: boolean) {
    this.isAuthenticatedSubject.next(status);
  }

  async setAccessToken(token: string): Promise<void> {
    await Preferences.set({
      key: auth.accessKey,
      value: token,
    });

    //  this.isAuthenticatedSubject.next(true);
  }

  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: auth.accessKey });
    return value;
  }

  async removeAccessToken(): Promise<void> {
    await Preferences.remove({ key: auth.accessKey });
  }

  /** Per-member session from OTP verification; sent as X-Member-Session for reward/voucher ownership. */
  async setMemberSession(token: string): Promise<void> {
    await Preferences.set({ key: auth.memberSessionKey, value: token });
    this.memberSessionChangedSubject.next(token);
  }

  async getMemberSession(): Promise<string | null> {
    const { value } = await Preferences.get({ key: auth.memberSessionKey });
    return value;
  }

  async removeMemberSession(): Promise<void> {
    await Preferences.remove({ key: auth.memberSessionKey });
    this.memberSessionChangedSubject.next(null);
  }

  /**
   * Removes the session only if it is still `token`. Used when a request made with `token` gets
   * member_session_required, so a late response cannot sign out a member who has since logged in.
   */
  async removeMemberSessionIfCurrent(token: string | null): Promise<void> {
    if (!token) return;
    if ((await this.getMemberSession()) === token) await this.removeMemberSession();
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: auth.refreshKey });
    return value;
  }

  async removeRefreshToken(): Promise<void> {
    await Preferences.remove({ key: auth.refreshKey });
  }

  async logout() {
    await Preferences.clear();
    this.isAuthenticatedSubject.next(false);
    this.memberSessionChangedSubject.next(null);
  }
}
