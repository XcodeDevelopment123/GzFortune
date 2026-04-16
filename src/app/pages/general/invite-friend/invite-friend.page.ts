import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Member } from 'src/app/core/models/member.model';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-invite-friend',
  templateUrl: './invite-friend.page.html',
  styleUrls: ['./invite-friend.page.scss'],
  standalone: false,
})
export class InviteFriendPage implements OnInit, OnDestroy {
  memberInfo!: Member;
  private destroy$ = new Subject<void>();

  constructor(private userStateService: UserStateService) {}

  ngOnInit() {
    this.userStateService.memberInfo.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res) {
          this.memberInfo = res;
        }
      },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
