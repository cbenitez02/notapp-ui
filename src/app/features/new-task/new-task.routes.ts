import { verifiedUserGuard } from '../auth/guards/authentication.guard';
import { NewTaskPage } from './pages/new-task.page';

export const NEW_TASK_ROUTES = [
  {
    path: 'new-task',
    component: NewTaskPage,
    title: 'Nueva tarea',
    canActivate: [verifiedUserGuard],
  },
];
