import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuDetailsPage } from './menu-details.page';

describe('MenuDetailsPage', () => {
  let component: MenuDetailsPage;
  let fixture: ComponentFixture<MenuDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
