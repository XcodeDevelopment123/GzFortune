import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HighlightPageRoutingModule } from './highlight-routing.module';

import { HighlightPage } from './highlight.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HighlightPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [HighlightPage],
})
export class HighlightPageModule {}
