import { Injectable, computed, signal } from '@angular/core';
import { RoutineResponse, RoutineTaskResponseDto } from '../../../core/interfaces/routine.interface';
import { TaskStateInterface } from '../../../core/interfaces/task-state.interface';
import { Task } from '../../../core/interfaces/task.interface';

export interface NewTaskState {
  selectedRoutine: string;
  selectedRoutineData: RoutineResponse | null;
  existingTasks: RoutineTaskResponseDto[];
  newTasks: Task[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskStateService implements TaskStateInterface {
  // Signals privados para el estado
  private readonly _selectedRoutine = signal<string>('');
  private readonly _selectedRoutineData = signal<RoutineResponse | null>(null);
  private readonly _existingTasks = signal<RoutineTaskResponseDto[]>([]);
  private readonly _newTasks = signal<Task[]>([]);

  // Signals públicos de solo lectura
  public readonly selectedRoutine = this._selectedRoutine.asReadonly();
  public readonly selectedRoutineData = this._selectedRoutineData.asReadonly();
  public readonly existingTasks = this._existingTasks.asReadonly();
  public readonly newTasks = this._newTasks.asReadonly();
  public readonly tasks = this._newTasks.asReadonly(); // Backward compatibility

  // Computed signals para información derivada
  public readonly taskCount = computed(() => this._newTasks().length);
  public readonly totalTime = computed(() => {
    return this._newTasks().reduce((total, task) => total + (task.duration || 0), 0);
  });

  // Computed signals para información de la rutina existente
  public readonly existingTaskCount = computed(() => this._existingTasks().length);
  public readonly existingTotalTime = computed(() => {
    return this._existingTasks().reduce((total, task) => total + (task.durationMin || 0), 0);
  });

  // Computed signals para totales combinados
  public readonly totalTaskCount = computed(() => this.existingTaskCount() + this.taskCount());
  public readonly totalCombinedTime = computed(() => this.existingTotalTime() + this.totalTime());

  public readonly hasValidRoutine = computed(() => this._selectedRoutine().trim().length > 0);
  public readonly hasTasks = computed(() => this._newTasks().length > 0);
  public readonly isValid = computed(() => this.hasValidRoutine() && this.hasTasks());

  // Métodos para actualizar el estado
  public updateSelectedRoutine(routine: string): void {
    this._selectedRoutine.set(routine);
  }

  public updateSelectedRoutineData(routineData: RoutineResponse | null): void {
    this._selectedRoutineData.set(routineData);
    if (routineData?.tasks) {
      this._existingTasks.set(routineData.tasks);
    } else {
      this._existingTasks.set([]);
    }
  }

  public updateTasks(tasks: Task[]): void {
    this._newTasks.set(tasks);
  }

  public addTask(task: Task): void {
    this._newTasks.update((tasks: Task[]) => [...tasks, task]);
  }

  public removeTask(index: number): void {
    this._newTasks.update((tasks: Task[]) => tasks.filter((_: Task, i: number) => i !== index));
  }

  public editTask(index: number, task: Task): void {
    this._newTasks.update((tasks: Task[]) => {
      const newTasks = [...tasks];
      newTasks[index] = task;
      return newTasks;
    });
  }

  // Método para resetear todo el estado
  public resetState(): void {
    this._selectedRoutine.set('');
    this._selectedRoutineData.set(null);
    this._existingTasks.set([]);
    this._newTasks.set([]);
  }

  // Método para obtener el estado completo
  public getCompleteState(): NewTaskState {
    return {
      selectedRoutine: this._selectedRoutine(),
      selectedRoutineData: this._selectedRoutineData(),
      existingTasks: this._existingTasks(),
      newTasks: this._newTasks(),
    };
  }
}
