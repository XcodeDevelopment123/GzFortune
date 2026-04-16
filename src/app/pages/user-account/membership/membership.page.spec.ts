import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MembershipPage } from './membership.page';

describe('MembershipPage', () => {
  let component: MembershipPage;
  let fixture: ComponentFixture<MembershipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
