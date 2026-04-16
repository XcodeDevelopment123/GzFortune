export interface SelectOption {
  label: string;
  value: any;
}

export type RewardPageTabs = 'voucher' | 'point' | 'stamp';

/// once add new type, need to go '/core/guards/history-type.guard' and add new type to the allowedTypes
export type HistoryPageType = 'order' | 'transaction' | 'stamp';
export type PaymentCheckoutPageType = 'topup' | 'pickup' | 'delivery';
// OTP verify page flow types
export type VerifyOTPPageType = 'login-phone' | 'forgot-password' | 'reset-password' | 'register';

export enum OrderTypePre {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

export enum LoginType {
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum VerifyOtpKey {
  LOGIN_PHONE = 'phone-otp',
  FORGOT_PASS = 'forgot-ps-otp',
  RESET_PASSWORD = 'reset-password-otp',
  REGISTER = 'register-otp',
}

/**
 * Enum used for page parameter keys.
 *
 * Provides standard query parameter keys to control page flow and navigation.
 *
 * @example
 * // Example of how to use the enum in router navigation
 * this.router.navigate(['page-path'], {
 *   queryParams: { [PageParamKey.BTOD]: '1' }
 * });
 *
 * @example
 * // Example of how to retrieve the query param from route
 * const btod = this.route.snapshot.queryParamMap.get(PageParamKey.BTOD);
 */
export enum PageParamKey {
  /**
   * Indicates whether the navigation jumped back from the order page.
   *
   * This key is used to control page flow logic and determine if the user
   * is navigating back to the order page.
   */
  BTOD = 'btod',

  /**
   * Outlet select,
   * In Outlet page, will use "Select This" instead of "Get Directions" button
   * Will not redirect to  google map, will trigger an subsribe page event
   */
  Order_Outlet_Select = 'oos',

  Order_Id = 'oid',

  Cart_Item_Id = 'ctid',
  Quantity = 'qty',
  Remark = 'remark',
  Edit = 'edit',
}
