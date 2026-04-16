import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InviteFriendPageRoutingModule } from './invite-friend-routing.module';

import { InviteFriendPage } from './invite-friend.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { ReferralCardComponent } from './components/referral-card/referral-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InviteFriendPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [InviteFriendPage, ReferralCardComponent],
})
export class InviteFriendPageModule {}
