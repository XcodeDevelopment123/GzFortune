import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuSearchPage } from './menu-search.page';

const routes: Routes = [
  {
    path: '',
    component: MenuSearchPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuSearchPageRoutingModule {}
