import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OutletsPage } from './outlets.page';

const routes: Routes = [
  {
    path: '',
    component: OutletsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OutletsPageRoutingModule {}
