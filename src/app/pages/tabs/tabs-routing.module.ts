import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { orderPageGuard } from 'src/app/core/guards/order-page.guard';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'outlets',
        loadChildren: () => import('./outlets/outlets.module').then((m) => m.OutletsPageModule),
        canActivate: [orderPageGuard],
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then((m) => m.AccountPageModule),
      },
      {
        path: 'wallet',
        loadChildren: () => import('./wallet/wallet.module').then((m) => m.WalletPageModule),
        canActivate: [authGuard],
      },
      {
        path: 'rewards',
        loadChildren: () => import('./rewards/rewards.module').then((m) => m.RewardsPageModule),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
