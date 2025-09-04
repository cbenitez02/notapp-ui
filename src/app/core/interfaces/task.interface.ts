import { RoutinePriority } from './routine.interface';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueTime?: string;
  category?: string;
  duration?: number; // Duración en minutos
}

export interface NextTasksResponse {
  data: Task[];
  message: string;
}

export interface CreateTaskRequest {
  tasks: CreateTaskItem[];
}

export interface CreateTaskItem {
  title: string;
  timeLocal?: string; // Si no se especifica, usa defaultTimeLocal de la rutina
  durationMin?: number;
  categoryId?: string;
  priority?: RoutinePriority;
  description?: string;
  sortOrder?: number;
}

export enum RoutineTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  MISSED = 'missed',
}
