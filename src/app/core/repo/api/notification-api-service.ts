import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import {
  Notification as AppNotification,
  notificationMapper,
} from 'src/app/core/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/MemberNotification';

  getMemberNotifications(phoneNumber: string): Observable<AppNotification[]> {
    const body = { PhoneNumber: phoneNumber };
    return this.baseApi
      .post<AppNotification[]>(`${this.ctrl}/GetNotificationsFilterMember`, body)
      .pipe(
        map((list): AppNotification[] =>
          list.map((dto) => dtoToModel<AppNotification, any>(dto, notificationMapper)),
        ),
      );
  }

  readAllNotifications(phoneNumber: string): Observable<string> {
    const body = { PhoneNumber: phoneNumber };
    return this.baseApi.post<string>(`${this.ctrl}/UserReadAllNotification`, body, {
      responseType: 'text',
    });
  }
}
