import { Component, OnInit } from '@angular/core';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { switchMap, take } from 'rxjs/operators';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { MemberAddress } from 'src/app/core/models/member.model';

@Component({
  selector: 'app-member-address',
  templateUrl: './member-address.page.html',
  styleUrls: ['./member-address.page.scss'],
  standalone: false,
})
export class MemberAddressPage implements OnInit {
  addressList: MemberAddress[] = [];

  hasAddress: boolean = false;

  constructor(
    private userApiService: UserApiService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    this.userStateService.memberInfo
      .pipe(
        take(1),
        switchMap((member) => {
          const phoneNumber = member?.phoneNumber;
          if (!phoneNumber) {
            throw new Error('Phone number not found');
          }
          return this.userApiService.getAllMemberAddress(phoneNumber);
        }),
        take(1),
      )
      .subscribe({
        next: (res) => {
          console.log('📦 地址列表:', res);
          this.addressList = res;
          this.hasAddress = res.length > 0;
        },
        error: (err) => {
          console.error('❌ API error:', err);
        },
      });
  }
}
