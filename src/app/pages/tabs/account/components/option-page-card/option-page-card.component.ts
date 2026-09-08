import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';

@Component({
  selector: 'app-option-page-card',
  templateUrl: './option-page-card.component.html',
  styleUrls: ['./option-page-card.component.scss'],
  standalone: false,
})
export class OptionPageCardComponent implements OnInit {
  @Input() memberInfo: Member | null = null;

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['memberInfo']) {
      console.log('🚀 memberInfo changed:', this.memberInfo);
    }
  }
  openOfficialWebsite() {
    window.open('https://www.facebook.com/share/1LYQsWDh44/?mibextid=wwXIfr', '_system');
  }
}
