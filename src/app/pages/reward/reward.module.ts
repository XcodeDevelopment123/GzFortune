import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RewardPageRoutingModule } from './reward-routing.module';

import { RewardPage } from './reward.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RewardPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [RewardPage],
})
export class RewardPageModule {}
