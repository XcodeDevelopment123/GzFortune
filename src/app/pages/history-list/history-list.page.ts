import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HistoryPageType } from 'src/app/shared/statics/interface-helper';

// ✅ 改成你实际路径
import { TransactionListComponent } from 'src/app/shared/components/transaction-list/transaction-list.component';


@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.page.html',
  styleUrls: ['./history-list.page.scss'],
  standalone: false,
})
export class HistoryListPage implements OnInit {
  historyHeaderText: string = '';
  historyType!: HistoryPageType;

  @ViewChild(TransactionListComponent) txnList?: TransactionListComponent;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const type = (this.route.snapshot.paramMap.get('type') as HistoryPageType) || '';
    switch (type) {
      case 'order':
        this.historyHeaderText = 'Order History';
        break;
      case 'transaction':
        this.historyHeaderText = 'Transaction History';
        break;
      case 'stamp':
        this.historyHeaderText = 'Stamp History';
        break;
    }
    this.historyType = type;
  }

  doRefresh(event: any) {
    const done = () => event.target.complete();

    // 只处理 transaction，其他类型直接 complete
    if (this.historyType !== 'transaction' || !this.txnList) {
      done();
      return;
    }

    this.txnList
      .refresh()
      .pipe(finalize(done))
      .subscribe({
        error: () => done(),
      });
  }
}
