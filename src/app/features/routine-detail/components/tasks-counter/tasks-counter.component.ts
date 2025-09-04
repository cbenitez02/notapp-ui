import { Component, computed, input } from '@angular/core';
import { RoutinesStatsResponse } from '../../../../core/interfaces/routine.interface';

export interface TasksCounterData {
  completed: number;
  lost: number;
  inProgress: number;
  pending: number;
}

@Component({
  selector: 'app-tasks-counter',
  templateUrl: './tasks-counter.component.html',
  styleUrls: ['./tasks-counter.component.css'],
})
export class TasksCounterComponent {
  public stats = input<RoutinesStatsResponse | null>(null);

  // Input para recibir los datos de las tareas
  public tasksData = input<TasksCounterData>({
    completed: 3,
    lost: 1,
    inProgress: 1,
    pending: 2,
  });

  // Computed para calcular el total de tareas
  public totalTasks = computed(() => {
    const data = this.tasksData();
    return data.completed + data.lost + data.inProgress + data.pending;
  });

  // Computed para calcular el porcentaje de progreso
  public progressPercentage = computed(() => {
    const data = this.tasksData();
    const total = this.totalTasks();
    if (total === 0) return 0;

    // El progreso incluye las tareas completadas y en progreso
    const progressTasks = data.completed + data.inProgress;
    return Math.round((progressTasks / total) * 100);
  });

  // Método para redondear hacia arriba el porcentaje de completación
  public getCeilCompletionPercentage(): number {
    const percentage = this.stats()?.dailyStats?.completionPercentage;
    return percentage ? Math.ceil(percentage) : 0;
  }
}
