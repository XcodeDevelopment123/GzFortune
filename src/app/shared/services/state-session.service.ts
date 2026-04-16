import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class StateSessionService {
  private readonly RETURN_KEY = 'auth:return';

  constructor(private router: Router) {}

  /**
   * 🚀 存储数据到 `state` + `sessionStorage`
   * @param key 存储的键名
   * @param data 需要存储的数据
   */
  setDataAndNavigate(url: string, key: string, data: any, extras?: NavigationExtras) {
    if (!key || !data) return;

    // 1️⃣ 存入 `sessionStorage`
    const encryptedData = btoa(JSON.stringify(data)); //simple Base64 encrypt
    sessionStorage.setItem(key, encryptedData);

    // 2️⃣ 传递到 `state`
    const navigationExtras: NavigationExtras = {
      ...(extras || {}),
      state: { ...(extras?.state || {}), [key]: data },
    };
    this.router.navigate([url], navigationExtras);
  }

  /**
   * 🚀 读取 `state`，如果 `state` 丢失则自动从 `sessionStorage` 获取
   * @param key 存储的键名
   * @returns 解析后的数据
   */
  getData<T>(key: string): T | null {
    if (!key) return null;

    // 1️⃣ 先尝试从 `state` 获取
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state[key]) {
      return navigation.extras.state[key] as T;
    }

    // 2️⃣ 如果 `state` 没有，从 `sessionStorage` 读取
    const encryptedData = sessionStorage.getItem(key);
    return encryptedData ? (JSON.parse(atob(encryptedData)) as T) : null;
  }

  /**
   * 🚀 清除 `sessionStorage` 中的指定 `key`
   * @param key 需要清除的键名
   */
  clearData(key: string) {
    sessionStorage.removeItem(key);
  }

  /** —— 回跳地址：集中管理 —— */

  /** 记录回跳地址（只允许站内路径） */
  setReturnUrl(url: string) {
    const safe = url && url.startsWith('/') ? url : '/home';
    sessionStorage.setItem(this.RETURN_KEY, safe);
  }

  /** 读取（不清除）回跳地址 */
  getReturnUrl(defaultUrl = '/home'): string {
    return sessionStorage.getItem(this.RETURN_KEY) || defaultUrl;
  }

  /** 读取并清除回跳地址 */
  consumeReturnUrl(defaultUrl = '/home'): string {
    const u = this.getReturnUrl(defaultUrl);
    sessionStorage.removeItem(this.RETURN_KEY);
    return u;
  }
}
