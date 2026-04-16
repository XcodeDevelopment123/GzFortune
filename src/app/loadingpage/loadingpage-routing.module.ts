import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadingpagePage } from './loadingpage.page';

const routes: Routes = [
  {
    path: '',
    component: LoadingpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadingpagePageRoutingModule {}
