import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartOrderPage } from './start-order.page';

describe('StartOrderPage', () => {
  let component: StartOrderPage;
  let fixture: ComponentFixture<StartOrderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StartOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
