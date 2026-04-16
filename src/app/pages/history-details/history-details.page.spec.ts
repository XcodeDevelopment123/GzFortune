import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryDetailsPage } from './history-details.page';

describe('HistoryDetailsPage', () => {
  let component: HistoryDetailsPage;
  let fixture: ComponentFixture<HistoryDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
