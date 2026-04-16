import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
// import { Outlet } from 'src/app/pages/general/outlets/outlets.page';
import { Outlet } from 'src/app/core/models/outlet.model';
@Injectable({
  providedIn: 'root',
})
export class PageStateService {
  private backToOrderPageFn: Subject<void> = new Subject<void>();
  private orderOutletSelectPageFn: Subject<Outlet> = new Subject<Outlet>();
  private orderPageAddItemToCartFn: Subject<any> = new Subject<any>();
  private editOrderSummaryFn: Subject<void> = new Subject<void>();
  private paymentCheckoutPageBackFn: Subject<void> = new Subject<void>();

  constructor() {}

  onTriggerBackToOrderPage() {
    return this.backToOrderPageFn.asObservable();
  }

  triggerBackToOrderPage() {
    this.backToOrderPageFn.next();
  }

  onTriggerOrderOutletSelectPage() {
    return this.orderOutletSelectPageFn.asObservable();
  }

  triggerOrderOutletSelectPage(outlet: Outlet) {
    this.orderOutletSelectPageFn.next(outlet);
  }

  onTriggerOderPageAddItemToCart() {
    return this.orderPageAddItemToCartFn.asObservable();
  }

  triggerOderPageAddItemToCart(req: any) {
    this.orderPageAddItemToCartFn.next(req);
  }

  onTriggerEditOrderSummary() {
    return this.editOrderSummaryFn.asObservable();
  }

  triggerEditOrderSummary() {
    this.editOrderSummaryFn.next();
  }

  onPaymentCheckoutPageBack() {
    return this.paymentCheckoutPageBackFn.asObservable();
  }

  triggerPaymentCheckoutPageBack() {
    this.paymentCheckoutPageBackFn.next();
  }
}
