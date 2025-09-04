import { RoutineTaskStatus } from './task.interface';

export interface RoutineResponse {
  id: string;
  userId: string;
  title: string;
  defaultTimeLocal?: string;
  repeatDaysJson: number[];
  active: boolean;
  icon?: number;
  createdAt: Date;
  tasks?: RoutineTaskResponseDto[];
}

export interface DailyTaskResponseResponse {
  dayOfWeek: number;
  dayName: string;
  tasks: RoutineTaskResponseDto[];
  totalTasks: number;
  routinesCount: number;
}

export interface RoutineTaskResponseDto {
  id: string;
  routineId: string;
  routineName: string;
  userId: string;
  title: string;
  dateLocal: string;
  timeLocal?: string;
  durationMin?: number;
  category?: CategoryResponseDto;
  priority: RoutinePriority;
  status: RoutineTaskStatus;
  startedAtLocal?: Date;
  completedAtLocal?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum RoutinePriority {
  ALTA = 'Alta',
  MEDIA = 'Media',
  BAJA = 'Baja',
}

export interface RoutinesStatsResponse {
  // Estadísticas del día actual
  dailyStats: {
    completedTasks: number;
    missedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    skippedTasks: number;
    totalTasks: number;
    completionPercentage: number;
  };

  // Estadísticas semanales
  weeklyStats: {
    currentWeekCompletion: number;
    previousWeekCompletion: number;
    improvementPercentage: number;
    activeRoutines: number;
  };
}
