import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SubPaymentSelectorModalComponent } from './sub-payment-selector-modal.component';

describe('SubPaymentSelectorModalComponent', () => {
  let component: SubPaymentSelectorModalComponent;
  let fixture: ComponentFixture<SubPaymentSelectorModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SubPaymentSelectorModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SubPaymentSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
