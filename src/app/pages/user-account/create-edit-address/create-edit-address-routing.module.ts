import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateEditAddressPage } from './create-edit-address.page';

const routes: Routes = [
  {
    path: '',
    component: CreateEditAddressPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateEditAddressPageRoutingModule {}
