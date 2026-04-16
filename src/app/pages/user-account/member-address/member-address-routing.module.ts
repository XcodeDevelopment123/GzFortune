import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemberAddressPage } from './member-address.page';

const routes: Routes = [
  {
    path: '',
    component: MemberAddressPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemberAddressPageRoutingModule {}
