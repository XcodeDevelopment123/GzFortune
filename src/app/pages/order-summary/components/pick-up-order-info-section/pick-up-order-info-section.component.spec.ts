import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PickUpOrderInfoSectionComponent } from './pick-up-order-info-section.component';

describe('PickUpOrderInfoSectionComponent', () => {
  let component: PickUpOrderInfoSectionComponent;
  let fixture: ComponentFixture<PickUpOrderInfoSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PickUpOrderInfoSectionComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(PickUpOrderInfoSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
