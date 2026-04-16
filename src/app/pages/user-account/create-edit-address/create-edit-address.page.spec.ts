import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateEditAddressPage } from './create-edit-address.page';

describe('CreateEditAddressPage', () => {
  let component: CreateEditAddressPage;
  let fixture: ComponentFixture<CreateEditAddressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
