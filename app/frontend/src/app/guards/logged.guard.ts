import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loggedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (typeof localStorage !== 'undefined' && authService.isLoggedIn()) {
    router.navigate(['/lobby']);
    return false;
  } else {
    return true;
  }
  //
};
