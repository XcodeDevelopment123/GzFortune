import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Highlight, highlightMapper } from '../../models/highlight.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({ providedIn: 'root' })
export class HighlightApiService {
  private baseApi = inject(BaseApiService);

  private ctrl: string = '/ManageHighlight';

  userGetHighlight(): Observable<Highlight[]> {
    return this.baseApi
      .get<any[]>(`${this.ctrl}/UserGetAllHighlight`)
      .pipe(map((list) => list.map((dto) => dtoToModel<Highlight, any>(dto, highlightMapper))));
  }

  userGetHighlightById(highlightId: string): Observable<Highlight> {
    const body = { HighlightId: highlightId };
    return this.baseApi
      .post<Highlight>(`${this.ctrl}/GetHighlightByHighLightId`, body)
      .pipe(map((dto) => dtoToModel<Highlight, any>(dto, highlightMapper)));
  }
}
