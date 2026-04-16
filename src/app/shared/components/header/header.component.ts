import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { combineLatest, distinctUntilChanged, map, Subject, takeUntil, tap } from 'rxjs';
import { Page, RootPath } from '../../statics/constants';
import { PageStateService } from '../../services/page-state.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { StateSessionService } from '../../services/state-session.service';
import { Member } from 'src/app/core/models/member.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() notificationEvent = new EventEmitter<any>();
  @Output() shareEvent = new EventEmitter<any>();

  @Input() isBackHeader: boolean = false;
  @Input() isModalHeader: boolean = false;
  @Input() page!: Page;
  @Input() headerText: string = '';
  @Input() rootPage: RootPath = 'home';

  memberInfo!: Member;
  notificationCount: number = 0;
  walletAmount: number = 0;
  isLoggedIn = false;
  loaded = false;

  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private pageStateService: PageStateService,
    private auth: AuthService,
    private userStateService: UserStateService,
    private router: Router,
    private stateSession: StateSessionService,
  ) {}

  ngOnInit() {
    // ✅ 订阅：登录状态 / member / wallet / walletLoading
    combineLatest([
      this.auth.isAuthenticated$,
      this.userStateService.memberInfo,
      this.userStateService.walletInfo,
      this.userStateService.walletLoading$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([isAuth, member, wallet, isLoading]) => {
          this.isLoggedIn = isAuth;
          this.memberInfo = member as any;

          if (!isAuth) {
            this.walletAmount = 0;
            this.loaded = true; // guest 不显示 skeleton
            return;
          }

          this.walletAmount = wallet?.balance ?? 0;
          this.loaded = !isLoading; // ✅ loading 时显示 skeleton
        }),
      )
      .subscribe();
  }

  goLogin() {
    this.stateSession.setReturnUrl(this.router.url);
    this.router.navigate(['/auth/login']);
  }

  navBack() {
    if (this.page === 'payment-checkout') {
      this.pageStateService.triggerPaymentCheckoutPageBack();
      return;
    }

    this.modalCtrl.getTop().then((modal) => {
      if (modal) {
        modal.dismiss();
      } else {
        this.navCtrl.pop().then((isPop) => {
          if (!isPop) {
            this.navCtrl.navigateRoot(`/${this.rootPage}`);
          }
        });
      }
    });
  }

  onShareClicked() {
    this.notificationEvent.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
