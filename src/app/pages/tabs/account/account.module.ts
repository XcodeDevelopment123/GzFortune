import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountPageRoutingModule } from './account-routing.module';

import { AccountPage } from './account.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { OptionPageCardComponent } from './components/option-page-card/option-page-card.component';
import { ReferralCardComponent } from './components/referral-card/referral-card.component';
import { AccountUserCardComponent } from './components/account-user-card/account-user-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [
    AccountPage,
    OptionPageCardComponent,
    ReferralCardComponent,
    AccountUserCardComponent,
  ],
})
export class AccountPageModule {}
