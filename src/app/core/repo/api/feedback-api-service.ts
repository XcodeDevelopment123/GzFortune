import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Feedback, feedbackMapper } from '../../models/feedback.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackApiService extends BaseApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/FeedBack';

  CreateFeedback(payload: Feedback): Observable<Feedback> {
    return this.baseApi
      .post<Feedback>(`${this.ctrl}/CreateFeedback`, payload, {
        responseType: 'text' as 'json',
      })
      .pipe(map((res) => dtoToModel<Feedback, any>(res, feedbackMapper)));
  }
}
