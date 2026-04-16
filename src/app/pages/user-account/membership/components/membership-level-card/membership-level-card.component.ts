import { Component, OnInit, ViewChild } from '@angular/core';
import Swiper from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { ActivatedRoute } from '@angular/router';
import { MembershipApiService } from 'src/app/core/repo/api/membership-api.service';
import { MembershipLevel, MembershipLevelResponse } from 'src/app/core/models/membership.model';

@Component({
  selector: 'app-membership-level-card',
  templateUrl: './membership-level-card.component.html',
  styleUrls: ['./membership-level-card.component.scss'],
  standalone: false,
})
export class MembershipLevelCardComponent implements OnInit {
  @ViewChild('swiper') swiperRef!: any;
  membershipDetails: MembershipLevel[] = [];
  point: number = 0;
  tier: string = '';

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
  constructor(
    private route: ActivatedRoute,
    private membershipApiService: MembershipApiService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const phone = params.get('phone');
      const point = params.get('point');
      const tier = params.get('tier');
      this.point = point ? Number(point) : 0;
      this.tier = tier ?? '';
      if (phone) {
        this.membershipApiService.getMembershiplevelByPhone(phone).subscribe({
          next: (res: MembershipLevelResponse) => {
            this.membershipDetails = res.membershipLevels;
          },
          error: (err) => {
            console.error('API error:', err);
          },
        });
      }
    });
  }

  ngAfterViewInit() {
    const swiper = this.swiperRef?.nativeElement?.swiper;

    if (swiper) {
      this.swiper = swiper;
      this.swiper.slideTo(0);
    }
  }

  getIndicatorMessage(i: MembershipLevel): string {
    if (i.upgradePoint === 0) {
      return `Congratulations!<br>&nbsp;&nbsp;&nbsp;&nbsp;You are already enjoying ${this.tier} benefits.`;
    }

    const remaining = i.upgradePoint - this.point;

    if (remaining > 0) {
      return `${remaining} points more to reach ${i.name} level.`;
    }

    return '';
  }

  getProgressValue(i: MembershipLevel): number {
    if (i.upgradePoint === 0) return 1;
    return Math.min(this.point / i.upgradePoint, 1);
  }
}
