export interface NewRoutineBody {
  title: string;
  repeatDaysJson: number[];
  createTasks: NewRoutineTask[];
}

export interface NewRoutineTask {
  title: string; // Título/nombre específico de la tarea
  dateLocal: string; // "2025-08-14"
  timeLocal?: string; // Si no se especifica, usa defaultTimeLocal de la rutina
  durationMin?: number; // Duración específica para esta tarea
  categoryId?: string; // Categoría específica de la tarea (puede diferir de la rutina)
  priority?: RoutinePriority; // Prioridad específica de la tarea (si no se especifica, usa la de la rutina)
  status?: RoutineTaskStatus;
  startedAtLocal?: Date; // Fecha y hora de inicio
  completedAtLocal?: Date; // Fecha y hora de completado
  description?: string; // Descripción adicional sobre la tarea
}

export interface NewRoutineResponseData {
  id: string;
  userId: string;
  title: string;
  defaultTimeLocal?: string;
  repeatDaysJson: number[];
  active: boolean;
  createdAt: Date;
  tasks: NewRoutineTask[];
}

export interface NewRoutineResponse {
  success: boolean;
  data: NewRoutineResponseData;
}

export enum RoutineTaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum RoutinePriority {
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja',
}
