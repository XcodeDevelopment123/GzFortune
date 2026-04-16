import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { NotificationApiService } from 'src/app/core/repo/api/notification-api-service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { DateHelperService } from 'src/app/shared/services/date-helper.service';
import { Notification as AppNotification } from 'src/app/core/models/notification.model';
@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: false,
})
export class NotificationPage implements OnInit {
  notifications: AppNotification[] = [];

  constructor(
    private userState: UserStateService,
    private notificationApi: NotificationApiService,
    public dateHelper: DateHelperService,
  ) {}

  ngOnInit() {
    this.userState.memberInfo.pipe(take(1)).subscribe((user) => {
      if (user?.phoneNumber) {
        this.notificationApi
          .getMemberNotifications(user.phoneNumber)
          .pipe(take(1))
          .subscribe((res: AppNotification[]) => {
            this.notifications = res.sort(
              (a, b) => new Date(b.pushTime).getTime() - new Date(a.pushTime).getTime(),
            );
          });
      }
    });
  }

  markReadNotification() {
    this.userState.memberInfo.pipe(take(1)).subscribe((user) => {
      if (user?.phoneNumber) {
        this.notificationApi
          .readAllNotifications(user.phoneNumber)
          .pipe(take(1))
          .subscribe((res) => {
            console.log('✅ 已标记为已读：', res);
            this.notifications.forEach((n) => (n.isUnread = false));
          });
      }
    });
  }
}
