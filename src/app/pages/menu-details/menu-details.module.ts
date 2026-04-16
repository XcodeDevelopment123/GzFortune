import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuDetailsPageRoutingModule } from './menu-details-routing.module';

import { MenuDetailsPage } from './menu-details.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuDetailsPageRoutingModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
  ],
  declarations: [MenuDetailsPage],
})
export class MenuDetailsPageModule {}
