import { verifiedUserGuard } from '../auth/guards/authentication.guard';
import { RoutineDetailPage } from './pages/routine-detail.page';

export const ROUTINE_DETAIL_ROUTES = [
  {
    path: 'routine-detail',
    component: RoutineDetailPage,
    title: 'Rutinas activa',
    canActivate: [verifiedUserGuard],
  },
];
