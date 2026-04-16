import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuSearchPageRoutingModule } from './menu-search-routing.module';

import { MenuSearchPage } from './menu-search.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuSearchPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [MenuSearchPage],
})
export class MenuSearchPageModule {}
