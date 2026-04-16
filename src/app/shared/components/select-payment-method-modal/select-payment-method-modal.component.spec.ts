import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelectPaymentMethodModalComponent } from './select-payment-method-modal.component';

describe('SelectPaymentMethodModalComponent', () => {
  let component: SelectPaymentMethodModalComponent;
  let fixture: ComponentFixture<SelectPaymentMethodModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectPaymentMethodModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectPaymentMethodModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
