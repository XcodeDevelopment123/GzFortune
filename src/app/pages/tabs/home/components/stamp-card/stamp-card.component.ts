import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';

@Component({
  selector: 'app-stamp-card',
  templateUrl: './stamp-card.component.html',
  styleUrls: ['./stamp-card.component.scss'],
  standalone: false,
})
export class StampCardComponent implements OnInit {
  @Input() memberInfo: Member | null = null;

  stampImages: string[] = [];

  private stampSlotTypes = ['cup', 'cup', 'gift', 'cup', 'cup', 'gift', 'cup', 'cup', 'gift'];

  constructor() {}

  ngOnInit() {
    this.updateStampImages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['memberInfo']) {
      this.updateStampImages();
    }
  }

  private updateStampImages(): void {
    const total = this.memberInfo?.totalStamp ?? 0;
    const hasData = !!this.memberInfo;
    //const total = 2;

    this.stampImages = this.stampSlotTypes.map((type, index) => {
      const isActive = hasData && index < total;
      return `/assets/images/stamp-item-${type}${isActive ? '-active' : ''}.png`;
    });
  }
}
