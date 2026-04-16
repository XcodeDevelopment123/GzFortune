import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Stamp } from 'src/app/core/models/stamp.model';
import Swiper from 'swiper';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-stamp-card',
  templateUrl: './stamp-card.component.html',
  styleUrls: ['./stamp-card.component.scss'],
  standalone: false,
})
export class StampCardComponent implements OnInit {
  @ViewChild('swiper') swiperRef!: any;
  @Input() stampList: Stamp[] = [];
  @Output() selectedStampChanged = new EventEmitter<any>();

  currentStampIndex = 0;
  swiper!: Swiper;
  config: SwiperOptions = {
    roundLengths: true,
    pagination: { clickable: true },
    freeMode: { enabled: false },
    spaceBetween: 8,
    slidesOffsetAfter: 6,
    slidesOffsetBefore: 6,
    breakpoints: {
      0: { slidesPerView: 1.3 },
      768: { slidesPerView: 1.5 },
      1024: { slidesPerView: 1.8 },
    },
    breakpointsBase: 'window',
    centeredSlides: true,
  };
  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stampList'] && this.stampList.length > 0) {
      const firstStamp = this.stampList[0];
      this.selectedStampChanged.emit(firstStamp); // ✅ 初始emit
    }
  }

  ngAfterViewInit() {
    const swiper = this.swiperRef?.nativeElement?.swiper;

    if (swiper) {
      swiper.on('slideChange', () => {
        const index = swiper.realIndex;
        const currentStamp = this.stampList[index];
        this.selectedStampChanged.emit(currentStamp);
      });
    }
  }
}
