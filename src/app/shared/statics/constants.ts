export const auth = { accessKey: 'accessToken', refreshKey: 'refreshToken' };

export const preferenceKeys = {
  first_time_open: 'first-time-open',
  current_order_type: 'order-type',
  keep_login_user_req: 'keep-login-user',
};

export type HeaderBackground = 'transparent' | null;
export type RootPath = 'wallet' | 'home' | 'account' | 'rewards' | 'order';
export type Page =
  | 'notification'
  | 'home'
  | 'account'
  | 'highlight'
  | 'reward'
  | 'payment-checkout'
  | 'voucher-detail';
