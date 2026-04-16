import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingpagePage } from './loadingpage.page';

describe('LoadingpagePage', () => {
  let component: LoadingpagePage;
  let fixture: ComponentFixture<LoadingpagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
