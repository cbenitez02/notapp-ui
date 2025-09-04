import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Routes } from '../../../core/constants/routes.constant';
import {
  RoutineResponse,
  RoutinesStatsResponse,
  RoutineTaskResponseDto,
} from '../../../core/interfaces/routine.interface';
import { RoutineTaskStatus } from '../../../core/interfaces/task.interface';
import { AlarmService } from '../../../core/services/alarm.service';
import { RoutinesService } from '../../../core/services/routines.service';
import { CurrentTaskComponent } from '../components/current-task/current-task.component';
import { RoutineHeaderComponent } from '../components/routine-header/routine-header.component';
import { RoutineListComponent } from '../components/routine-list/routine-list.component';
import { TaskListComponent } from '../components/task-list/task-list.component';
import { TasksCounterComponent } from '../components/tasks-counter/tasks-counter.component';

@Component({
  selector: 'app-routine-detail',
  templateUrl: './routine-detail.page.html',
  styleUrls: ['./routine-detail.page.css'],
  imports: [
    RoutineHeaderComponent,
    CurrentTaskComponent,
    TasksCounterComponent,
    TaskListComponent,
    RoutineListComponent,
  ],
})
export class RoutineDetailPage implements OnInit {
  private readonly router = inject(Router);
  private readonly routineService = inject(RoutinesService);
  private readonly alarmService = inject(AlarmService);

  @ViewChild(CurrentTaskComponent) currentTaskComponent!: CurrentTaskComponent;

  public allTasks = signal<RoutineTaskResponseDto[]>([]);
  public currentTask = signal<RoutineTaskResponseDto | null>(null);
  public nextTask = signal<RoutineTaskResponseDto | null>(null);
  public stats = signal<RoutinesStatsResponse | null>(null);
  public activeRoutines = signal<RoutineResponse[]>([]);

  ngOnInit(): void {
    this.routineService.getTaskForToday().subscribe((tasksForToday) => {
      // Establecer todas las tareas
      this.allTasks.set(tasksForToday.tasks);

      // 🚨 CONECTAR TAREAS AL SERVICIO DE ALARMAS
      this.alarmService.setTasks(tasksForToday.tasks);
      this.alarmService.fixMissingDates(); // Corregir fechas faltantes automáticamente
      this.alarmService.forceCheckAlarms(); // Verificar alarmas inmediatamente

      // Buscar la tarea actualmente en progreso
      const currentTaskInProgress = tasksForToday.tasks.find((task) => task.status === 'in_progress');
      this.currentTask.set(currentTaskInProgress || null);

      // Buscar la próxima tarea según la línea de tiempo
      this.setNextTask(tasksForToday.tasks);

      // Inicializar las estadísticas locales si ya tenemos estadísticas del servidor
      if (this.stats()) {
        this.updateLocalStats(tasksForToday.tasks);
      }
    });

    this.routineService.getRoutinesStats().subscribe((stats) => {
      this.stats.set(stats);

      // Si ya tenemos tareas cargadas, actualizar las estadísticas localmente
      if (this.allTasks().length > 0) {
        this.updateLocalStats(this.allTasks());
      }
    });

    this.routineService.getRoutines().subscribe((routines) => {
      // Filtrar solo las rutinas activas
      const activeRoutines = routines.filter((routine) => routine.active);
      this.activeRoutines.set(activeRoutines);
    });
  }

  private setNextTask(tasks: RoutineTaskResponseDto[]): void {
    // Filtrar solo las tareas pendientes que tengan hora definida
    const pendingTasks = tasks.filter((task) => task.status === 'pending' && task.timeLocal);

    if (pendingTasks.length === 0) {
      this.nextTask.set(null);
      return;
    }

    // Obtener la hora actual
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convertir a minutos

    // Convertir las horas de las tareas a minutos y filtrar las futuras
    const futureTasks = pendingTasks
      .map((task) => {
        const [hours, minutes] = task.timeLocal!.split(':').map(Number);
        const taskTimeInMinutes = hours * 60 + minutes;
        return {
          ...task,
          timeInMinutes: taskTimeInMinutes,
        };
      })
      .filter((task) => task.timeInMinutes > currentTime) // Solo tareas futuras
      .sort((a, b) => a.timeInMinutes - b.timeInMinutes); // Ordenar por hora

    // Si no hay tareas futuras hoy, buscar la primera tarea del día siguiente
    if (futureTasks.length === 0) {
      // Tomar la primera tarea pendiente del día (para el día siguiente)
      const firstTaskOfDay = pendingTasks
        .map((task) => {
          const [hours, minutes] = task.timeLocal!.split(':').map(Number);
          const taskTimeInMinutes = hours * 60 + minutes;
          return {
            ...task,
            timeInMinutes: taskTimeInMinutes,
          };
        })
        .sort((a, b) => a.timeInMinutes - b.timeInMinutes)[0];

      this.nextTask.set(firstTaskOfDay || null);
    } else {
      // Tomar la próxima tarea del día
      this.nextTask.set(futureTasks[0]);
    }
  }

  public onBack(): void {
    this.router.navigate([Routes.HOME]);
  }

  public onCompleteTask(task: RoutineTaskResponseDto): void {
    // Llamar al endpoint para actualizar el estado en el backend
    this.routineService.updateTaskStatus(task.id, 'completed').subscribe({
      next: () => {
        // Actualizar el estado local solo si la API responde exitosamente
        const updatedTasks = this.allTasks().map((t) =>
          t.id === task.id ? { ...t, status: 'completed' as RoutineTaskStatus } : t,
        );
        this.allTasks.set(updatedTasks);

        // 🚨 ACTUALIZAR ALARMAS CON TAREAS MODIFICADAS
        this.alarmService.setTasks(updatedTasks);
        this.alarmService.forceCheckAlarms();

        // Limpiar la tarea actual y buscar la siguiente
        this.currentTask.set(null);
        this.setNextTask(updatedTasks);

        // Actualizar las estadísticas localmente
        this.updateLocalStats(updatedTasks);

        // Resetear el estado de loading
        this.currentTaskComponent?.resetLoadingState();
      },
      error: () => {
        // Resetear el estado de loading en caso de error
        this.currentTaskComponent?.resetLoadingState();
        // Aquí podrías mostrar un mensaje de error al usuario
        // Por ejemplo, con un toast o notification service
      },
    });
  }

  public onSkipTask(task: RoutineTaskResponseDto): void {
    // Llamar al endpoint para actualizar el estado en el backend
    this.routineService.updateTaskStatus(task.id, 'skipped').subscribe({
      next: () => {
        // Actualizar el estado local solo si la API responde exitosamente
        const updatedTasks = this.allTasks().map((t) =>
          t.id === task.id ? { ...t, status: 'skipped' as RoutineTaskStatus } : t,
        );
        this.allTasks.set(updatedTasks);

        // 🚨 ACTUALIZAR ALARMAS CON TAREAS MODIFICADAS
        this.alarmService.setTasks(updatedTasks);
        this.alarmService.forceCheckAlarms();

        // Limpiar la tarea actual y buscar la siguiente
        this.currentTask.set(null);
        this.setNextTask(updatedTasks);

        // Actualizar las estadísticas localmente
        this.updateLocalStats(updatedTasks);

        // Resetear el estado de loading
        this.currentTaskComponent?.resetLoadingState();
      },
      error: (error) => {
        console.error('Error al saltear la tarea:', error);
        // Resetear el estado de loading en caso de error
        this.currentTaskComponent?.resetLoadingState();
        // Aquí podrías mostrar un mensaje de error al usuario
        // Por ejemplo, con un toast o notification service
      },
    });
  }

  // Método para manejar actualizaciones de tareas desde el TaskListComponent
  public onTaskUpdated(updatedTasks: RoutineTaskResponseDto[]): void {
    // Actualizar el estado local
    this.allTasks.set(updatedTasks);

    // 🚨 ACTUALIZAR ALARMAS CON TAREAS MODIFICADAS
    this.alarmService.setTasks(updatedTasks);
    this.alarmService.forceCheckAlarms();

    // Actualizar la tarea actual si cambió
    const currentTaskInProgress = updatedTasks.find((task) => task.status === 'in_progress');
    this.currentTask.set(currentTaskInProgress || null);

    // Recalcular la próxima tarea
    this.setNextTask(updatedTasks);

    // Actualizar las estadísticas localmente
    this.updateLocalStats(updatedTasks);
  }

  // Método para calcular estadísticas locales basándose en las tareas actuales
  private updateLocalStats(tasks: RoutineTaskResponseDto[]): void {
    const currentStats = this.stats();
    if (!currentStats) return;

    // Contar tareas por estado
    const completedTasks = tasks.filter((task) => task.status === 'completed').length;
    const missedTasks = tasks.filter((task) => task.status === 'missed').length;
    const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
    const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
    const skippedTasks = tasks.filter((task) => task.status === 'skipped').length;
    const totalTasks = tasks.length;

    // Calcular porcentaje de completación
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Actualizar las estadísticas manteniendo los datos semanales y mensuales existentes
    const updatedStats: RoutinesStatsResponse = {
      ...currentStats,
      dailyStats: {
        ...currentStats.dailyStats,
        completedTasks,
        missedTasks,
        inProgressTasks,
        pendingTasks,
        skippedTasks,
        totalTasks,
        completionPercentage,
      },
    };

    this.stats.set(updatedStats);
  }
}
