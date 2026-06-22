import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface MobileAppVersionResponse {
  androidAppVersion: string;
  iosAppVersion: string;
  pwaVersion?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PwaUpdateService {
  private readonly versionApiUrl = `${environment.apiUrl}/MobileAppVersion/GetMobileAppVersion`;

  constructor(private http: HttpClient) {}

  /**
   * Check if the PWA needs to be updated.
   * Only runs in WEB (PWA) mode — skipped for native APP builds.
   */
  public async checkForUpdate(): Promise<void> {
    if (environment.platform !== 'WEB') {
      console.log('[PwaUpdateService] Native APP — skipping PWA update check.');
      return;
    }

    this.http.get<MobileAppVersionResponse>(this.versionApiUrl).subscribe({
      next: async (res) => {
        const latestVersion = res.pwaVersion;
        const currentVersion = environment.pwaVersion;

        if (!latestVersion) {
          console.log('[PwaUpdateService] No PWA version set on server — skipping.');
          return;
        }

        if (latestVersion !== currentVersion) {
          console.warn(
            `[PwaUpdateService] New version! Server: ${latestVersion}, Local: ${currentVersion}. Reloading...`,
          );
          await this.forceRefreshAndClearCache();
        } else {
          console.log('[PwaUpdateService] PWA is up to date:', currentVersion);
        }
      },
      error: (err) => {
        console.error('[PwaUpdateService] Failed to fetch version:', err);
      },
    });
  }

  private async forceRefreshAndClearCache(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      window.location.reload();
    } catch (err) {
      console.error('[PwaUpdateService] Error during cache clear / reload:', err);
    }
  }
}
