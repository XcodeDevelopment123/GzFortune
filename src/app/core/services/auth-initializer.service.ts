import { Injectable } from '@angular/core';
import { AuthApiService } from '../repo/api/auth-api.service';
import { UserApiService } from '../repo/api/user-api.service';
import { AuthService } from './auth.service';
import { UserStateService } from './user-state.service';
import { BehaviorSubject, lastValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthInitializerService {
  private _initDone$ = new BehaviorSubject(false);

  public initDone$ = this._initDone$.asObservable();

  constructor(
    private authService: AuthService,
    private authApiService: AuthApiService,
    private userApiService: UserApiService,
    private userStateService: UserStateService,
  ) {}

  async init(): Promise<void> {
    try {
      const token = await this.authService.getAccessToken();
      if (!token) {
        await lastValueFrom(this.authApiService.getAccessToken());
      }

      const keepLogin = await this.userStateService.getKeepLoginRequest();
      if (keepLogin) {
        await lastValueFrom(this.userApiService.getMemberDetails(keepLogin).pipe(take(1)));
        this.authService.setAuthenticated(true);
      } else {
        this.authService.setAuthenticated(false);
      }
    } catch (err) {
      console.error('[AuthInitializer] initial failed:', err);
      this.authService.setAuthenticated(false); // fallback to guest
    } finally {
      this._initDone$.next(true);
    }
  }
}
