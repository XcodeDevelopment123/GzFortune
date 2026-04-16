import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { StorageHelperService } from 'src/app/shared/services/storage-helper.service';
import { OrderTypePre, PageParamKey } from 'src/app/shared/statics/interface-helper';

@Component({
  selector: 'app-start-order',
  templateUrl: './start-order.page.html',
  styleUrls: ['./start-order.page.scss'],
  standalone: false,
})
export class StartOrderPage implements OnInit {
  OrderType = OrderTypePre;

  isPickupAvailable: boolean = false;
  isDeliveryAvailable: boolean = false;

  backToOrderPage: boolean = false;
  constructor(
    private storageHelper: StorageHelperService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private pageStateService: PageStateService,
  ) {}

  ngOnInit() {
    // this.checkBackToOrderPage();

    //Call api check, check is at least one outlet is support pickup/delivery

    //if no one, disabled two option, and notify user current not available

    //if yes
    this.isDeliveryAvailable = false;
    this.isPickupAvailable = true;
  }

  async selectType(type: OrderTypePre) {
    // await this.storageHelper.setCurrentOrderPre(type);

    this.pageStateService.triggerBackToOrderPage();

    if (this.backToOrderPage) {
      this.navCtrl.back();
      return;
    }

    this.router.navigateByUrl('/order');
  }

  checkBackToOrderPage() {
    const btod = this.route.snapshot.queryParamMap.get(PageParamKey.BTOD);
    this.backToOrderPage = btod === '1';

    if (btod !== null) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { [PageParamKey.BTOD]: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }
}
