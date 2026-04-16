import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OutletsPageRoutingModule } from './outlets-routing.module';

import { OutletsPage } from './outlets.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OutletsPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [OutletsPage],
})
export class OutletsPageModule {}
