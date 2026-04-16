import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberAddressPage } from './member-address.page';

describe('MemberAddressPage', () => {
  let component: MemberAddressPage;
  let fixture: ComponentFixture<MemberAddressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
