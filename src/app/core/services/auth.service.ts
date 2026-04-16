import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';
import { auth, preferenceKeys } from 'src/app/shared/statics/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

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
  }
}
