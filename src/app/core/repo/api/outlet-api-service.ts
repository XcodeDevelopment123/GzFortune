import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { Outlet, outletMapper } from '../../models/outlet.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({ providedIn: 'root' })
export class OutletApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/ManageOutlets';

  getAllOutlets(): Observable<Outlet[]> {
    return this.baseApi
      .get<Outlet[]>(`${this.ctrl}/GetAllOutlets`)
      .pipe(map((list) => list.map((dto) => dtoToModel<Outlet, any>(dto, outletMapper))));
  }

  getOutletById(OutletsId: string): Observable<Outlet> {
    return this.baseApi
      .post<Outlet>(`${this.ctrl}/FindOutletsByOutletsId`, { OutletsId })
      .pipe(map((dto) => dtoToModel<Outlet, any>(dto, outletMapper)));
  }
}
