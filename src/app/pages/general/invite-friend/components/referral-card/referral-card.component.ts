import { Component, Input, OnInit } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';

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
  shareReferralCode() {}
}
