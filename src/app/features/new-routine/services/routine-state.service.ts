import { Injectable, computed, signal } from '@angular/core';
import { TaskStateInterface } from '../../../core/interfaces/task-state.interface';
import { Task } from '../../../core/interfaces/task.interface';

export interface RoutineState {
  routineName: string;
  selectedDays: string[];
  tasks: Task[];
}

@Injectable({
  providedIn: 'root',
})
export class RoutineStateService implements TaskStateInterface {
  // Signals privados para el estado
  private readonly _routineName = signal<string>('');
  private readonly _selectedDays = signal<string[]>([]);
  private readonly _tasks = signal<Task[]>([]);

  // Signals públicos de solo lectura
  public readonly routineName = this._routineName.asReadonly();
  public readonly selectedDays = this._selectedDays.asReadonly();
  public readonly tasks = this._tasks.asReadonly();

  // Computed signals para información derivada
  public readonly taskCount = computed(() => this._tasks().length);
  public readonly dayCount = computed(() => this._selectedDays().length);
  public readonly totalTime = computed(() => {
    return this._tasks().reduce((total, task) => total + (task.duration || 0), 0);
  });

  public readonly dayLabels = computed(() => {
    const dayMap: Record<string, string> = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom',
    };
    return this._selectedDays().map((day) => dayMap[day] || day);
  });

  // Métodos para actualizar el estado
  public updateRoutineName(name: string): void {
    this._routineName.set(name);
  }

  public updateSelectedDays(days: string[]): void {
    this._selectedDays.set(days);
  }

  public updateTasks(tasks: Task[]): void {
    this._tasks.set(tasks);
  }

  public addTask(task: Task): void {
    this._tasks.update((tasks) => [...tasks, task]);
  }

  public removeTask(index: number): void {
    this._tasks.update((tasks) => tasks.filter((_, i) => i !== index));
  }

  // Método para resetear todo el estado
  public resetState(): void {
    this._routineName.set('');
    this._selectedDays.set([]);
    this._tasks.set([]);
  }

  // Método para obtener el estado completo
  public getCompleteState(): RoutineState {
    return {
      routineName: this._routineName(),
      selectedDays: this._selectedDays(),
      tasks: this._tasks(),
    };
  }
}
