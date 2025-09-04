import { Routes } from '@angular/router';
import { verifiedUserGuard } from '../auth/guards/authentication.guard';
import { HomePage } from './pages/home.page';

export const HOME_ROUTES: Routes = [
  {
    path: 'home',
    component: HomePage,
    title: 'Home',
    canActivate: [verifiedUserGuard],
  },
];
