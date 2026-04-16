import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { preferenceKeys } from '../statics/constants';
import { OrderTypePre } from '../statics/interface-helper';

@Injectable({
  providedIn: 'root',
})
export class StorageHelperService {
  constructor() {}

  /**
   * Get Current login session order pre, use it before enter order page, if no setting any, redirect to start-order page
   */
  // async getCurrentOrderPre(): Promise<string | null> {
  //   const result = await Preferences.get({
  //     key: preferenceKeys.current_order_type,
  //   });

  //   return result.value;
  // }

  /**
   * Set the current login session using order pre
   * @param type 'DineIn_Pickup' | 'Delivery'
   */
  // async setCurrentOrderPre(type: OrderTypePre): Promise<void> {
  //   await Preferences.set({
  //     key: preferenceKeys.current_order_type,
  //     value: type,
  //   });
  // }

  /**
   * Remove previous pre, should call it once app launch
   */
  async removeCurrentOrderPre(): Promise<void> {
    await Preferences.remove({
      key: preferenceKeys.current_order_type,
    });
  }

  async setFirstTimeOpen(): Promise<void> {
    await Preferences.set({
      key: preferenceKeys.first_time_open,
      value: '1',
    });
  }

  async checkFirstTimeOpen(): Promise<boolean> {
    const { value } = await Preferences.get({
      key: preferenceKeys.first_time_open,
    });
    return value === '1';
  }
}
