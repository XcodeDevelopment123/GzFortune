import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionHistory } from 'src/app/core/models/transactionhistory.model';
import type { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DateHelperService } from 'src/app/shared/services/date-helper.service';

@Component({
  selector: 'app-stamp-list',
  templateUrl: './stamp-list.component.html',
  styleUrls: ['./stamp-list.component.scss'],
  standalone: false,
})
export class StampListComponent implements OnInit {
  stampHistoryResult: TransactionHistory[] | null = null;
  visibleStamps: TransactionHistory[] = [];

  pageSize = 30;
  currentIndex = 0;
  phoneNumber: string = '';

  constructor(
    private router: Router,
    private dateHelper: DateHelperService,
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { [key: string]: any };

    const stampData = state?.['stampData'];
    const phoneNumber = state?.['phoneNumber'];

    if (stampData) {
      this.stampHistoryResult = stampData;
    }

    if (phoneNumber) {
      this.phoneNumber = phoneNumber;
    }
    this.loadMoreStamps();
  }

  getLocaleDate(date: string): string {
    return this.dateHelper.formatLocale(date);
  }

  async loadMoreStamps(event?: InfiniteScrollCustomEvent) {
    console.log('loadMoreStamps called');
    await new Promise((r) => setTimeout(r, 600));
    const nextPage = this.stampHistoryResult!.slice(
      this.currentIndex,
      this.currentIndex + this.pageSize,
    );
    this.visibleStamps = this.visibleStamps.concat(nextPage);
    this.currentIndex += this.pageSize;

    // 模拟加载延迟
    setTimeout(() => {
      if (event) event.target.complete();

      if (this.visibleStamps.length >= this.stampHistoryResult!.length && event) {
        console.log('✅ All stamps loaded, disabling infinite scroll');
        event.target.disabled = true;
      }
    }, 1000); // 延迟1秒
  }
}
