import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HighlightPage } from './highlight.page';

const routes: Routes = [
  {
    path: '',
    component: HighlightPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HighlightPageRoutingModule {}
