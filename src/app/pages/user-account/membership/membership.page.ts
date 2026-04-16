import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Swiper, SwiperOptions } from 'swiper/types';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.page.html',
  styleUrls: ['./membership.page.scss'],
  standalone: false,
})
export class MembershipPage implements OnInit, AfterViewInit {
  @ViewChild('swiper') swiperRef!: any;

  swiper!: Swiper;
  config: SwiperOptions = {
    roundLengths: true,
    pagination: { clickable: true },
    freeMode: { enabled: false },
    spaceBetween: 16,
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

  ngAfterViewInit() {
    const swiper = this.swiperRef?.nativeElement?.swiper;

    if (swiper) {
      this.swiper = swiper;
      this.swiper.slideTo(1);
    }
  }
}
