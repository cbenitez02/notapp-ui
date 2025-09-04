import { Component, computed, DestroyRef, inject, Input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoutineStateService } from '../../../features/new-routine/services/routine-state.service';
import { TaskStateService } from '../../../features/new-task/services/task-state.service';
import { CategoryResponse } from '../../interfaces/categories.interfaces';
import { CategoriesService } from '../../services/categories.service';

export type PreviewMode = 'routine' | 'task';

@Component({
  selector: 'app-preview-shared',
  standalone: true,
  templateUrl: './preview-shared.component.html',
  styleUrls: ['./preview-shared.component.css'],
})
export class PreviewSharedComponent {
  @Input() mode: PreviewMode = 'routine';

  private readonly routineStateService = inject(RoutineStateService, { optional: true });
  private readonly taskStateService = inject(TaskStateService, { optional: true });
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);

  // Signal para las categorías
  public readonly categories = signal<CategoryResponse[]>([]);

  // Computed signals que se adaptan al modo
  public readonly title = computed(() => {
    return this.mode === 'routine' ? 'Vista previa de la rutina' : 'Vista previa de tareas';
  });

  public readonly routineName = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.routineName();
    } else if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.selectedRoutine();
    }
    return '';
  });

  public readonly tasks = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.tasks();
    } else if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.newTasks();
    }
    return [];
  });

  // Computed signals específicos para el modo task con información combinada
  public readonly existingTasks = computed(() => {
    if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.existingTasks();
    }
    return [];
  });

  public readonly newTasks = computed(() => {
    if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.newTasks();
    }
    return [];
  });

  public readonly existingTaskCount = computed(() => {
    if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.existingTaskCount();
    }
    return 0;
  });

  public readonly existingTotalTime = computed(() => {
    if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.existingTotalTime();
    }
    return 0;
  });

  public readonly totalTaskCount = computed(() => {
    if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.totalTaskCount();
    } else if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.taskCount();
    }
    return 0;
  });

  public readonly totalCombinedTime = computed(() => {
    if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.totalCombinedTime();
    } else if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.totalTime();
    }
    return 0;
  });

  public readonly taskCount = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.taskCount();
    } else if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.taskCount();
    }
    return 0;
  });

  public readonly totalTime = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.totalTime();
    } else if (this.mode === 'task' && this.taskStateService) {
      return this.taskStateService.totalTime();
    }
    return 0;
  });

  // Solo para rutinas
  public readonly selectedDays = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.selectedDays();
    }
    return [];
  });

  public readonly dayCount = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.dayCount();
    }
    return 0;
  });

  public readonly dayLabels = computed(() => {
    if (this.mode === 'routine' && this.routineStateService) {
      return this.routineStateService.dayLabels();
    }
    return [];
  });

  // Computed signals para determinar qué mostrar
  public readonly hasRoutineName = computed(() => this.routineName().trim().length > 0);
  public readonly hasData = computed(() => {
    if (this.mode === 'routine') {
      return this.hasRoutineName() || this.dayCount() > 0 || this.taskCount() > 0;
    } else {
      // Para modo task: mostrar datos si hay rutina seleccionada O tareas nuevas
      return this.hasRoutineName() || this.existingTaskCount() > 0 || this.taskCount() > 0;
    }
  });
  public readonly hasChipsData = computed(() => {
    if (this.mode === 'routine') {
      return this.dayCount() > 0 || this.taskCount() > 0;
    } else {
      // Para modo task: mostrar chips si hay rutina seleccionada O tareas nuevas
      return this.existingTaskCount() > 0 || this.taskCount() > 0;
    }
  });

  constructor() {
    // Cargar categorías inmediatamente en el constructor
    this.loadCategories();
  }

  // Computed signal para mapear tareas con nombres de categorías
  public readonly tasksWithCategoryNames = computed(() => {
    const allTasks = this.tasks();
    const allCategories = this.categories();

    // Solo procesar si tenemos categorías cargadas
    if (allCategories.length === 0) {
      return allTasks.map((task) => ({
        ...task,
        categoryName: task.category || 'Cargando...',
      }));
    }

    return allTasks.map((task) => {
      const categoryName = this.getCategoryName(task.category, allCategories);

      return {
        ...task,
        categoryName,
      };
    });
  });

  private loadCategories(): void {
    this.categoriesService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        },
      });
  }

  // Método para obtener el nombre de la categoría por ID
  public getCategoryName(categoryId: string | undefined, categories?: CategoryResponse[]): string {
    if (!categoryId) return 'Sin categoría';

    const categoriesToUse = categories || this.categories();
    const category = categoriesToUse.find((cat) => cat.id === categoryId);
    const result = category?.name || categoryId;

    return result;
  }

  // Método para eliminar tareas
  public removeTask(index: number): void {
    if (this.mode === 'routine' && this.routineStateService) {
      this.routineStateService.removeTask(index);
    } else if (this.mode === 'task' && this.taskStateService) {
      this.taskStateService.removeTask(index);
    }
  }

  // Método para obtener la etiqueta del día
  public getDayLabel(day: string | number): string {
    // Si es una fecha ISO, extraer el día de la semana
    if (typeof day === 'string' && day.includes('-')) {
      const date = new Date(day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayMap: Record<number, string> = {
        0: 'Domingo',
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
      };
      return dayMap[dayOfWeek] || day.toString();
    }

    // Para otros formatos
    const dayMap: Record<string, string> = {
      '1': 'Lunes',
      '2': 'Martes',
      '3': 'Miércoles',
      '4': 'Jueves',
      '5': 'Viernes',
      '6': 'Sábado',
      '0': 'Domingo',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    };
    return dayMap[day.toString()] || day.toString();
  }

  // Método para formatear la duración
  public formatDuration(minutes: number | undefined): string {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  }
}
