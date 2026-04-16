import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingHelperService {
  private loadingStatus$ = new BehaviorSubject<boolean>(false);

  constructor(private loadingCtrl: LoadingController) {}

  /**
   * Returns an Ionic loading element, manually created but not presented.
   */
  async getWaiting() {
    return this.loadingCtrl.create({ message: 'please wait...' });
  }

  /**
   * Observable stream of global loading status.
   */
  get loading$(): Observable<boolean> {
    return this.loadingStatus$.asObservable();
  }

  /**
   * Trigger the global brand loading UI to show.
   * Used by pages/components to indicate loading state.
   */
  show() {
    this.loadingStatus$.next(true);
  }

  /**
   * Dismiss the global brand loading UI.
   * Used after async tasks to end loading state.
   */
  hide() {
    this.loadingStatus$.next(false);
  }
}
