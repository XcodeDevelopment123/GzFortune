import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { UserCardInfoComponent } from './components/user-card-info/user-card-info.component';
import { FeatureCardComponent } from './components/feature-card/feature-card.component';
import { HighlightListComponent } from './components/highlight-list/highlight-list.component';
import { RewardListComponent } from './components/reward-list/reward-list.component';
import { StampCardComponent } from './components/stamp-card/stamp-card.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule, SharedComponentsModule],
  declarations: [
    HomePage,
    UserCardInfoComponent,
    FeatureCardComponent,
    HighlightListComponent,
    RewardListComponent,
    StampCardComponent,
  ],
})
export class HomePageModule {}
