import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import {
  MembershipLevelResponse,
  MembershipLevelResponseMapper,
} from '../../models/membership.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({ providedIn: 'root' })
export class MembershipApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/ManageMembershipLevels';

  getMembershiplevelByPhone(phone: string): Observable<MembershipLevelResponse> {
    const body = { PhoneNumber: phone };
    return this.baseApi
      .post<MembershipLevelResponse>(`${this.ctrl}/GetAllMembershipLevelDetails`, body)
      .pipe(
        map((dto) => dtoToModel<MembershipLevelResponse, any>(dto, MembershipLevelResponseMapper)),
      );
  }
}
