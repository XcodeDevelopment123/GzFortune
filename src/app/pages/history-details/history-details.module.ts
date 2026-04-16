import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryDetailsPageRoutingModule } from './history-details-routing.module';

import { HistoryDetailsPage } from './history-details.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { OrderHistoryDetailsComponent } from './components/order-history-details/order-history-details.component';
import { TransactionHistoryDetailsComponent } from './components/transaction-history-details/transaction-history-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryDetailsPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [
    HistoryDetailsPage,
    OrderHistoryDetailsComponent,
    TransactionHistoryDetailsComponent,
  ],
})
export class HistoryDetailsPageModule {}
