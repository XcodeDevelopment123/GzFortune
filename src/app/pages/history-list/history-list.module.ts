import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryListPageRoutingModule } from './history-list-routing.module';

import { HistoryListPage } from './history-list.page';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { OrderListComponent } from './components/order-list/order-list.component';
import { StampListComponent } from './components/stamp-list/stamp-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryListPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [HistoryListPage, OrderListComponent, StampListComponent],
})
export class HistoryListPageModule {}
