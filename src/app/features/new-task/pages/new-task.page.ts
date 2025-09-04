import { ViewportScroller } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewSharedComponent } from '../../../core/components/preview-shared/preview-shared.component';
import {
  SharedTaskFormComponent,
  TASK_STATE_SERVICE,
} from '../../../core/components/shared-task-form/shared-task-form.component';
import { RoutinePriority } from '../../../core/interfaces/routine.interface';
import { CreateTaskRequest, Task } from '../../../core/interfaces/task.interface';
import { RoutineSelectorComponent } from '../components/routine-selector/routine-selector.component';
import { NewTaskService } from '../services/new-task.service';
import { TaskStateService } from '../services/task-state.service';

@Component({
  selector: 'app-new-task',
  standalone: true,
  templateUrl: './new-task.page.html',
  styleUrls: ['./new-task.page.css'],
  imports: [RoutineSelectorComponent, SharedTaskFormComponent, PreviewSharedComponent],
  providers: [
    {
      provide: TASK_STATE_SERVICE,
      useExisting: TaskStateService,
    },
  ],
})
export class NewTaskPage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly newTaskService = inject(NewTaskService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly taskStateService = inject(TaskStateService);

  // Signals para manejo de estado de creación
  public readonly isCreatingTasks = signal<boolean>(false);
  public readonly createError = signal<string | null>(null);

  // Computed signals para validaciones
  public readonly isValid = computed(() => this.taskStateService.isValid());

  ngOnInit(): void {
    // Forzar scroll al top cuando se inicializa la página
    this.viewportScroller.scrollToPosition([0, 0]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Reset del contenedor main-content
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // Usar setTimeout para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const mainContentAfter = document.querySelector('.main-content') as HTMLElement;
      if (mainContentAfter) {
        mainContentAfter.scrollTop = 0;
      }
    }, 0);

    // Limpiar el estado cuando se inicializa la página
    this.taskStateService.resetState();
  }

  public onSaveTasks(): void {
    if (this.isValid() && !this.isCreatingTasks()) {
      this.isCreatingTasks.set(true);
      this.createError.set(null);

      const taskData = this.taskStateService.getCompleteState();

      // Verificar que tenemos una rutina seleccionada con ID
      if (!taskData.selectedRoutineData?.id) {
        this.createError.set('Debe seleccionar una rutina válida.');
        this.isCreatingTasks.set(false);
        return;
      }

      // Mapear las tareas al formato requerido por la API
      const tasksToCreate = this.mapTasksToCreateRequests(taskData.newTasks);

      console.log('Datos de tareas a crear:', tasksToCreate);

      this.newTaskService
        .createMultipleTasks(taskData.selectedRoutineData.id, tasksToCreate)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            console.log('Tareas creadas exitosamente:', response);
            this.isCreatingTasks.set(false);

            // Limpiar el estado después de crear las tareas
            this.taskStateService.resetState();

            // Navegar de vuelta a la página anterior o al home como fallback
            const returnUrl = this.route.snapshot.queryParams['returnUrl'];
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl);
            } else {
              this.router.navigate(['/'], {
                queryParams: { tasksCreated: 'true' },
              });
            }
          },
          error: (error) => {
            console.error('Error al crear las tareas:', error);
            this.isCreatingTasks.set(false);
            this.createError.set('Error al crear las tareas. Por favor, inténtalo de nuevo.');
          },
        });
    }
  }

  private mapTasksToCreateRequests(tasks: Task[]): CreateTaskRequest {
    return {
      tasks: tasks.map((task) => ({
        title: task.title,
        timeLocal: this.formatTimeToHHMMSS(task.dueTime),
        durationMin: task.duration,
        categoryId: task.category,
        priority: this.mapPriorityToEnum(task.priority),
        description: task.description,
      })),
    };
  }

  private formatTimeToHHMMSS(time: string | undefined): string {
    // Si no hay tiempo, devolver valor por defecto
    if (!time) {
      return '00:00:00';
    }

    // Si el tiempo ya viene en formato HH:MM:SS, devolverlo tal como está
    const hhmmssRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (hhmmssRegex.exec(time)) {
      return time;
    }

    // Si viene en formato HH:MM, agregar :00 al final
    const hhmmRegex = /^\d{2}:\d{2}$/;
    if (hhmmRegex.exec(time)) {
      return time + ':00';
    }

    // Si no tiene formato válido, devolver un valor por defecto
    return '00:00:00';
  }

  private mapPriorityToEnum(priority: string): RoutinePriority {
    switch (priority) {
      case 'high':
        return RoutinePriority.ALTA;
      case 'medium':
        return RoutinePriority.MEDIA;
      case 'low':
        return RoutinePriority.BAJA;
      default:
        return RoutinePriority.MEDIA;
    }
  }

  public onBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }
}
