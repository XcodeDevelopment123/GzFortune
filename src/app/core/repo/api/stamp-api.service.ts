import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import { Stamp, stampMapper } from '../../models/stamp.model';

@Injectable({ providedIn: 'root' })
export class StampApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/ManageStamp';

  userGetStamp(): Observable<Stamp[]> {
    return this.baseApi
      .get<any[]>(`${this.ctrl}/GetAllStamps`)
      .pipe(map((list) => list.map((dto) => dtoToModel<Stamp, any>(dto, stampMapper))));
  }
}
