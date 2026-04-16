import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadingpagePageRoutingModule } from './loadingpage-routing.module';

import { LoadingpagePage } from './loadingpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingpagePageRoutingModule
  ],
  declarations: [LoadingpagePage]
})
export class LoadingpagePageModule {}
