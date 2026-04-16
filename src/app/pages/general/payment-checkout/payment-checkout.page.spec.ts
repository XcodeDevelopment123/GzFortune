import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentCheckoutPage } from './payment-checkout.page';

describe('PaymentCheckoutPage', () => {
  let component: PaymentCheckoutPage;
  let fixture: ComponentFixture<PaymentCheckoutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCheckoutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
