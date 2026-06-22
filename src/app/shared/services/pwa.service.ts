import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  /** Show the Android/Chrome install banner */
  public showInstallBanner = new BehaviorSubject<boolean>(false);

  /** Show the iOS Safari "Add to Home Screen" guide */
  public showIosInstallBanner = new BehaviorSubject<boolean>(false);

  constructor() {
    // ── Android / Chrome ────────────────────────────────────────
    // The beforeinstallprompt event fires BEFORE Angular boots.
    // index.html captures it early into window.__pwaInstallEvent.
    // We check for it here, and also keep listening for future fires.
    this.checkEarlyCapturedEvent();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      (window as any).__pwaInstallEvent = event;
      console.log('[PwaService] beforeinstallprompt received.');
      if (localStorage.getItem('pwa-install-dismissed') !== 'true') {
        this.showInstallBanner.next(true);
      }
    });

    // Hide banner once the user installs the app
    window.addEventListener('appinstalled', () => {
      console.log('[PwaService] App installed.');
      this.showInstallBanner.next(false);
      (window as any).__pwaInstallEvent = null;
    });

    // ── iOS Safari ──────────────────────────────────────────────
    this.checkIosInstall();
  }

  /**
   * Check if beforeinstallprompt was captured early in index.html
   * before Angular loaded. Show the banner if so.
   */
  private checkEarlyCapturedEvent() {
    if ((window as any).__pwaInstallEvent) {
      console.log('[PwaService] Using early-captured beforeinstallprompt event.');
      if (localStorage.getItem('pwa-install-dismissed') !== 'true') {
        this.showInstallBanner.next(true);
      }
    }
  }

  private checkIosInstall() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS

    const isInStandaloneMode =
      'standalone' in window.navigator && (window.navigator as any)['standalone'];

    if (
      isIos &&
      !isInStandaloneMode &&
      localStorage.getItem('ios-pwa-install-dismissed') !== 'true'
    ) {
      this.showIosInstallBanner.next(true);
    }
  }

  /** Trigger the native install prompt (Android/Chrome) */
  public promptInstall() {
    const event = (window as any).__pwaInstallEvent;
    if (event) {
      event.prompt();
      event.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PwaService] User accepted the install prompt.');
        } else {
          console.log('[PwaService] User dismissed the install prompt.');
        }
        (window as any).__pwaInstallEvent = null;
        this.showInstallBanner.next(false);
      });
    }
  }

  /** Dismiss the Android install banner (remembers via localStorage) */
  public dismissInstall() {
    this.showInstallBanner.next(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  }

  /** Dismiss the iOS install guide (remembers via localStorage) */
  public dismissIosInstall() {
    this.showIosInstallBanner.next(false);
    localStorage.setItem('ios-pwa-install-dismissed', 'true');
  }

  /** Reset dismissal flags — useful for testing */
  public resetDismissalFlags() {
    localStorage.removeItem('pwa-install-dismissed');
    localStorage.removeItem('ios-pwa-install-dismissed');
  }
}
