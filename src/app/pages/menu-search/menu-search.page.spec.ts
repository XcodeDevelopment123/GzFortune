import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuSearchPage } from './menu-search.page';

describe('MenuSearchPage', () => {
  let component: MenuSearchPage;
  let fixture: ComponentFixture<MenuSearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
