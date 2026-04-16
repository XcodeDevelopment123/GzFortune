import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthInitializerService } from '../services/auth-initializer.service';
import { combineLatest, filter, take, map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const authInitService = inject(AuthInitializerService);

  const router = inject(Router);

  return combineLatest([authInitService.initDone$, authService.isAuthenticated$]).pipe(
    filter(([initDone]) => initDone),
    take(1),
    map(([_, isAuth]) => {
      if (!isAuth) {
        router.navigate(['/auth/login']);
        return false;
      }
      return true;
    }),
  );
};
