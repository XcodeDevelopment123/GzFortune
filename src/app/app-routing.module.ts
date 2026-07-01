import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { historyTypeGuard } from './core/guards/history-type.guard';
import { paymentTypeGuard } from './core/guards/payment-type.guard';
import { authGuard } from './core/guards/auth.guard';
import { auth } from './shared/statics/constants';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'start-order',
    loadChildren: () =>
      import('./pages/start-order/start-order.module').then((m) => m.StartOrderPageModule),
  },
  {
    path: 'menu-details/:id',
    loadChildren: () =>
      import('./pages/menu-details/menu-details.module').then((m) => m.MenuDetailsPageModule),
  },
  {
    path: 'menu-search',
    loadChildren: () =>
      import('./pages/menu-search/menu-search.module').then((m) => m.MenuSearchPageModule),
  },
  {
    path: 'order-details/:id',
    loadChildren: () =>
      import('./pages/order-details/order-details.module').then((m) => m.OrderDetailsPageModule),
    canActivate: [authGuard],
  },
  {
    path: 'order-summary',
    loadChildren: () =>
      import('./pages/order-summary/order-summary.module').then((m) => m.OrderSummaryPageModule),
    canActivate: [authGuard],
  },
  {
    path: 'notification',
    loadChildren: () =>
      import('./pages/notification/notification.module').then((m) => m.NotificationPageModule),
    canActivate: [authGuard],
  },
  {
    path: 'on-boarding',
    loadChildren: () =>
      import('./pages/on-boarding/on-boarding.module').then((m) => m.OnBoardingPageModule),
  },
  {
    path: 'highlight/:id',
    loadChildren: () =>
      import('./pages/highlight/highlight.module').then((m) => m.HighlightPageModule),
  },
  {
    path: 'reward/:id',
    loadChildren: () => import('./pages/reward/reward.module').then((m) => m.RewardPageModule),
  },
  {
    path: 'voucher-detail/:id',
    loadChildren: () =>
      import('./pages/voucher-detail/voucher-detail.module').then(
        (m) => m.VoucherDetailPageModule,
      ),
  },
  {
    path: 'history-list/:type',
    loadChildren: () =>
      import('./pages/history-list/history-list.module').then((m) => m.HistoryListPageModule),
    canActivate: [historyTypeGuard, authGuard],
  },
  {
    path: 'history-details/:type/:id',
    loadChildren: () =>
      import('./pages/history-details/history-details.module').then(
        (m) => m.HistoryDetailsPageModule,
      ),
    canActivate: [historyTypeGuard, authGuard],
  },
  {
    path: 'account/edit-profile',
    loadChildren: () =>
      import('./pages/user-account/edit-profile/edit-profile.module').then(
        (m) => m.EditProfilePageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'account/reset-password',
    loadChildren: () =>
      import('./pages/user-account/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'account/delete-account',
    loadChildren: () =>
      import('./pages/user-account/delete-account/delete-account.module').then(
        (m) => m.DeleteAccountPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'account/member-address',
    loadChildren: () =>
      import('./pages/user-account/member-address/member-address.module').then(
        (m) => m.MemberAddressPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'account/membership',
    loadChildren: () =>
      import('./pages/user-account/membership/membership.module').then(
        (m) => m.MembershipPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'account/create-address',
    loadChildren: () =>
      import('./pages/user-account/create-edit-address/create-edit-address.module').then(
        (m) => m.CreateEditAddressPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'account/edit-address/:id',
    loadChildren: () =>
      import('./pages/user-account/create-edit-address/create-edit-address.module').then(
        (m) => m.CreateEditAddressPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'outlets',
    loadChildren: () =>
      import('./pages/tabs/outlets/outlets.module').then((m) => m.OutletsPageModule),
  },
  {
    path: 'general/about-us',
    loadChildren: () =>
      import('./pages/general/about-us/about-us.module').then((m) => m.AboutUsPageModule),
  },
  {
    path: 'general/feedback',
    loadChildren: () =>
      import('./pages/general/feedback/feedback.module').then((m) => m.FeedbackPageModule),
    canActivate: [authGuard],
  },
  {
    path: 'general/invite-friend',
    loadChildren: () =>
      import('./pages/general/invite-friend/invite-friend.module').then(
        (m) => m.InviteFriendPageModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'general/payment-checkout/:type',
    loadChildren: () =>
      import('./pages/general/payment-checkout/payment-checkout.module').then(
        (m) => m.PaymentCheckoutPageModule,
      ),
    canActivate: [paymentTypeGuard, authGuard],
  },
  {
    path: 'auth/login',
    loadChildren: () => import('./pages/auth/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'auth/register',
    loadChildren: () =>
      import('./pages/auth/register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'auth/forgot-password',
    loadChildren: () =>
      import('./pages/auth/forgot-password/forgot-password.module').then(
        (m) => m.ForgotPasswordPageModule,
      ),
  },
  {
    path: 'auth/otp-verify/:type',
    loadChildren: () =>
      import('./pages/auth/otp-verify/otp-verify.module').then((m) => m.OtpVerifyPageModule),
  },
  {
    path: 'loading',
    loadChildren: () =>
      import('./loadingpage/loadingpage.module').then((m) => m.LoadingpagePageModule),
  },
  {
    //Must be last of route
    //Not found page handle
    path: '**',
    redirectTo: 'home',
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
