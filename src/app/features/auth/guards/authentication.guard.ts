import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Routes } from '../../../core/constants/routes.constant';
import { AuthenticationService } from '../services/authentication.service';

// Guard genérico: permite parametrizar si se requiere estar autenticado o no
export function createAuthGuard(requireAuth: boolean, redirectTo: string): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    const isAuth = authService.isAuthenticated();
    if (requireAuth) {
      if (isAuth) {
        return true;
      } else {
        router.navigate([redirectTo], { queryParams: { returnUrl: state.url } });
        return false;
      }
    } else if (!isAuth) {
      return true;
    } else {
      router.navigate([redirectTo]);
      return false;
    }
  };
}

// Guard para rutas que requieren autenticación completa (token válido + email verificado)
export function createFullAuthGuard(): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate([Routes.LOGIN], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (!authService.isEmailVerified()) {
      router.navigate([Routes.EMAIL_VERIFICATION]);
      return false;
    }

    return true;
  };
}

// Guards predefinidos para uso común
export const authGuard: CanActivateFn = createAuthGuard(true, Routes.LOGIN);
export const guestGuard: CanActivateFn = createAuthGuard(false, Routes.HOME);
export const verifiedUserGuard: CanActivateFn = createFullAuthGuard();
