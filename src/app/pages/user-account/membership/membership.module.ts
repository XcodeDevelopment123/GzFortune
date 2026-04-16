import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MembershipPageRoutingModule } from './membership-routing.module';

import { MembershipPage } from './membership.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { MembershipLevelCardComponent } from './components/membership-level-card/membership-level-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembershipPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [MembershipPage, MembershipLevelCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MembershipPageModule {}
