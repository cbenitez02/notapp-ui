import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/new-routine/new-routine.routes').then((m) => m.NEW_ROUTINE_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/routine-detail/routine-detail.routes').then((m) => m.ROUTINE_DETAIL_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('./features/new-task/new-task.routes').then((m) => m.NEW_TASK_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
