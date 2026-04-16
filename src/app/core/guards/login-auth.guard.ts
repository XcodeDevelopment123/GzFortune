import { CanActivateFn, Router } from '@angular/router';
import { UserStateService } from '../services/user-state.service';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const loginAuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
