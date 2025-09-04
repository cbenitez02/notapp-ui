import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/authentication.guard';
import { EmailVerificationPage } from './pages/email-verification/email-verification.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginPage,
    title: 'Iniciar sesión',
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterPage,
    title: 'Registrarse',
    canActivate: [guestGuard],
  },
  {
    path: 'email-verification',
    component: EmailVerificationPage,
    canActivate: [authGuard],
    title: 'Verificación de email',
  },
];
