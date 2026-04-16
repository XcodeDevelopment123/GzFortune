import { Component, Input, OnInit } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-referral-card',
  templateUrl: './referral-card.component.html',
  styleUrls: ['./referral-card.component.scss'],
  standalone: false,
})
export class ReferralCardComponent implements OnInit {
  @Input() memberInfo: Member | null = null;

  constructor() {}

  ngOnInit() {}

  copyToClipboard() {}

  async shareReferralCode(code: string) {
    await Share.share({
      title: 'Share Referral Code',
      text: 'Join Our App now to get more reward \n',
      url: `https://juicyportal.xcode.com.my/sharelink/referral/${code}`,
      dialogTitle: 'Share With',
    });
  }
}
