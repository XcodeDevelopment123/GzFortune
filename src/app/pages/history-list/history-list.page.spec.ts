import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryListPage } from './history-list.page';

describe('HistoryListPage', () => {
  let component: HistoryListPage;
  let fixture: ComponentFixture<HistoryListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
