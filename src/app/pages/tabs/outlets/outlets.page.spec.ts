import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutletsPage } from './outlets.page';

describe('OutletsPage', () => {
  let component: OutletsPage;
  let fixture: ComponentFixture<OutletsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OutletsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
