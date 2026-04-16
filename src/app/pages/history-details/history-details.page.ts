import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { HistoryApiService } from 'src/app/core/repo/api/history-api.service';
import { HistoryPageType } from 'src/app/shared/statics/interface-helper';
import { take } from 'rxjs';
import { OrderHistory } from 'src/app/core/models/delivery.model';

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.page.html',
  styleUrls: ['./history-details.page.scss'],
  standalone: false,
})
export class HistoryDetailsPage implements OnInit {
  historyHeaderText: string = '';
  historyType!: HistoryPageType;
  orderId: string = '';
  phoneNumber: string = '';
  orderDetails: OrderHistory | null = null;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private historyApiService: HistoryApiService,
  ) {}

  ngOnInit() {
    const type = (this.route.snapshot.paramMap.get('type') as HistoryPageType) || '';
    const id = (this.route.snapshot.paramMap.get('id') as string) || '';
    switch (type) {
      case 'order':
        this.historyHeaderText = 'Order Details';
        break;
      case 'transaction':
        this.historyHeaderText = 'Transaction Details';
        break;
      case 'stamp':
        this.navCtrl.back();
        break;
    }

    this.historyType = type;
    this.orderId = id;

    this.route.queryParamMap.subscribe((queryParams) => {
      this.phoneNumber = queryParams.get('phone') || '';
    });

    if (this.orderId && this.phoneNumber) {
      this.getOrderDetails();
    }
  }

  getOrderDetails() {
    const body = {
      OrderId: this.orderId,
      PhoneNumber: this.phoneNumber,
    };

    this.historyApiService
      .getOrderHistoryByOrderId(body)
      .pipe(take(1))
      .subscribe((res) => {
        this.orderDetails = res;
      });
  }
}
