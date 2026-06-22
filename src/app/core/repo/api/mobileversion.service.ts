import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';

type MobileAppVersionDTO = {
  androidAppVersion: string;
  iosAppVersion: string;
  pwaVersion?: string;
};

@Injectable({ providedIn: 'root' })
export class MobileAppVersionService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/MobileAppVersion';

  getMobileAppVersion(): Observable<MobileAppVersionDTO> {
    return this.baseApi
      .get<MobileAppVersionDTO>(`${this.ctrl}/GetMobileAppVersion`);
  }
}
