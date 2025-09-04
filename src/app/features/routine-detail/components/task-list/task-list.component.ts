import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RoutineTaskResponseDto } from '../../../../core/interfaces/routine.interface';
import { RoutineTaskStatus } from '../../../../core/interfaces/task.interface';
import { RoutinesService } from '../../../../core/services/routines.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent {
  private readonly routinesService = inject(RoutinesService);

  tasks = input<RoutineTaskResponseDto[]>([]);

  // Outputs para comunicarse con el padre
  taskAction = output<{ taskId: string; action: string }>();
  secondaryAction = output<{ taskId: string }>();
  taskUpdated = output<RoutineTaskResponseDto[]>();

  // Estados de loading para cada tarea
  private readonly loadingStates = signal<Record<string, boolean>>({});

  totalTasks = computed(() => this.tasks().length);

  // Getter para acceder a los estados de loading
  getLoadingState(taskId: string): boolean {
    return this.loadingStates()[taskId] || false;
  }

  // Setter para actualizar el estado de loading de una tarea específica
  private setLoadingState(taskId: string, loading: boolean): void {
    this.loadingStates.update((states) => ({
      ...states,
      [taskId]: loading,
    }));
  }

  getTaskById(taskId: string): RoutineTaskResponseDto | undefined {
    return this.tasks().find((task) => task.id === taskId);
  }

  formatTime(time: string | undefined): string {
    if (!time) return '';
    // Si el tiempo viene en formato HH:mm:ss, quitar los segundos
    const timeParts = time.split(':');
    return timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : time;
  }

  getTaskBorderClass(status: string): string {
    switch (status) {
      case 'missed':
        return 'task-border-error';
      case 'completed':
        return 'task-border-success';
      case 'skipped':
        return 'task-border-warning';
      case 'pending':
        return 'task-border-primary';
      case 'in_progress':
        return 'task-border-info';
      default:
        return 'task-border-default';
    }
  }

  getStatusAction(status: string): { text: string; action: string; class: string } {
    switch (status) {
      case 'missed':
        return { text: 'Perdida', action: 'recover', class: 'btn-error' };
      case 'completed':
        return { text: 'Deshacer', action: 'undo', class: 'btn-secondary' };
      case 'skipped':
        return { text: 'Deshacer', action: 'undo_skip', class: 'btn-secondary' };
      case 'pending':
        return { text: 'Completar', action: 'complete', class: 'btn-success' };
      case 'in_progress':
        return { text: 'Completar', action: 'complete', class: 'btn-success' };
      default:
        return { text: 'Completar', action: 'complete', class: 'btn-success' };
    }
  }

  // Método para determinar si estamos dentro del rango de duración de una tarea
  private isWithinTaskDuration(task: RoutineTaskResponseDto): boolean {
    if (!task.timeLocal || !task.durationMin) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Convertir la hora de la tarea a minutos
    const [hours, minutes] = task.timeLocal.split(':').map(Number);
    const taskStartTime = hours * 60 + minutes;
    const taskEndTime = taskStartTime + task.durationMin;

    // Verificar si la hora actual está dentro del rango
    return currentTime >= taskStartTime && currentTime <= taskEndTime;
  }

  // Método para determinar el estado al que debe volver una tarea completada
  getUndoTargetStatus(task: RoutineTaskResponseDto): 'pending' | 'in_progress' {
    return this.isWithinTaskDuration(task) ? 'in_progress' : 'pending';
  }

  // Método para determinar si una tarea completada ha pasado su tiempo de duración
  hasTaskCompletedAndExpired(task: RoutineTaskResponseDto): boolean {
    if (task.status !== 'completed' || !task.timeLocal || !task.durationMin) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Convertir la hora de la tarea a minutos
    const [hours, minutes] = task.timeLocal.split(':').map(Number);
    const taskStartTime = hours * 60 + minutes;
    const taskEndTime = taskStartTime + task.durationMin;

    // La tarea ha expirado si el tiempo actual es posterior al tiempo de finalización
    return currentTime > taskEndTime;
  }

  // Método para determinar si se deben mostrar los botones de acción
  shouldShowActionButtons(task: RoutineTaskResponseDto): boolean {
    // No mostrar botones si la tarea está missed
    if (task.status === 'missed') {
      return false;
    }

    // No mostrar botones si la tarea está completada y ya ha pasado su duración
    if (this.hasTaskCompletedAndExpired(task)) {
      return false;
    }

    return true;
  }

  onTaskAction(taskId: string, action: string): void {
    if (action === 'undo' || action === 'undo_skip') {
      // Para tareas completadas o saltadas, determinar el estado objetivo
      const task = this.getTaskById(taskId);
      if (task) {
        const targetStatus = this.getUndoTargetStatus(task);
        const routineTaskStatus =
          targetStatus === 'in_progress' ? RoutineTaskStatus.IN_PROGRESS : RoutineTaskStatus.PENDING;
        this.handleTaskStatusUpdate(taskId, routineTaskStatus);
      }
    } else if (action === 'complete') {
      this.handleTaskStatusUpdate(taskId, RoutineTaskStatus.COMPLETED);
    } else if (action === 'skip') {
      this.handleTaskStatusUpdate(taskId, RoutineTaskStatus.SKIPPED);
    } else {
      // Emitir al padre para otros casos especiales
      this.taskAction.emit({ taskId, action });
    }
  }

  onSecondaryAction(taskId: string): void {
    const task = this.getTaskById(taskId);
    if (!task) return;

    if (task.status === 'skipped') {
      // Para tareas saltadas, el botón secundario debe completarlas
      this.handleTaskStatusUpdate(taskId, RoutineTaskStatus.COMPLETED);
    } else {
      // Para tareas pending e in_progress, el botón secundario es "saltear"
      this.handleTaskStatusUpdate(taskId, RoutineTaskStatus.SKIPPED);
    }
  }

  // Método principal para manejar actualizaciones de estado con llamada al API
  private handleTaskStatusUpdate(taskId: string, newStatus: RoutineTaskStatus): void {
    // Activar loading state
    this.setLoadingState(taskId, true);

    this.routinesService.updateTaskStatus(taskId, newStatus).subscribe({
      next: () => {
        // Actualizar el estado local
        const updatedTasks = this.tasks().map((task) => (task.id === taskId ? { ...task, status: newStatus } : task));

        // Emitir las tareas actualizadas al componente padre
        this.taskUpdated.emit(updatedTasks);

        // Desactivar loading state
        this.setLoadingState(taskId, false);
      },
      error: (error) => {
        console.error(`Error al actualizar tarea a ${newStatus}:`, error);

        // Desactivar loading state en caso de error
        this.setLoadingState(taskId, false);

        // Aquí podrías emitir un evento de error o mostrar un mensaje
        // Para mantener consistencia con el current-task component
      },
    });
  }
}
