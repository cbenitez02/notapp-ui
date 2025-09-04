import { verifiedUserGuard } from '../auth/guards/authentication.guard';
import { NewRoutinePage } from './pages/new-routine.page';

export const NEW_ROUTINE_ROUTES = [
  {
    path: 'new-routine',
    component: NewRoutinePage,
    title: 'Nueva rutina',
    canActivate: [verifiedUserGuard],
  },
];
