import { ViewportScroller } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewSharedComponent } from '../../../core/components/preview-shared/preview-shared.component';
import {
  SharedTaskFormComponent,
  TASK_STATE_SERVICE,
} from '../../../core/components/shared-task-form/shared-task-form.component';
import { Task } from '../../../core/interfaces/task.interface';
import { RoutineFormComponent } from '../components/routine-form/routine-form.component';
import {
  NewRoutineBody,
  NewRoutineTask,
  RoutinePriority,
  RoutineTaskStatus,
} from '../interfaces/new-routine.interface';
import { NewRoutineService } from '../services/new-routine.service';
import { RoutineStateService } from '../services/routine-state.service';

@Component({
  selector: 'app-new-routine',
  templateUrl: './new-routine.page.html',
  styleUrls: ['./new-routine.page.css'],
  imports: [RoutineFormComponent, SharedTaskFormComponent, PreviewSharedComponent],
  providers: [
    {
      provide: TASK_STATE_SERVICE,
      useExisting: RoutineStateService,
    },
  ],
})
export class NewRoutinePage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly newRoutineService = inject(NewRoutineService);
  private readonly destroyRef = inject(DestroyRef);
  public readonly routineStateService = inject(RoutineStateService);

  // Signals para manejo de estado de creación
  public readonly isCreatingRoutine = signal<boolean>(false);
  public readonly createError = signal<string | null>(null);

  // Computed signals para validaciones individuales
  public readonly hasValidName = computed(() => this.routineStateService.routineName().trim().length >= 3);
  public readonly hasDays = computed(() => this.routineStateService.dayCount() > 0);
  public readonly hasTasks = computed(() => this.routineStateService.taskCount() > 0);

  // Computed signal para determinar si la rutina es válida
  public readonly isRoutineValid = computed(() => this.hasValidName() && this.hasDays() && this.hasTasks());

  ngOnInit(): void {
    // Forzar scroll al top cuando se inicializa la página
    this.viewportScroller.scrollToPosition([0, 0]);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Reset del contenedor main-content (el verdadero responsable del scroll)
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // Usar setTimeout para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Double-check del main-content
      const mainContentAfter = document.querySelector('.main-content') as HTMLElement;
      if (mainContentAfter) {
        mainContentAfter.scrollTop = 0;
      }
    }, 0);

    // Limpiar el estado cuando se inicializa la página
    this.routineStateService.resetState();
  }

  public onSaveRoutine(): void {
    if (this.isRoutineValid() && !this.isCreatingRoutine()) {
      this.isCreatingRoutine.set(true);
      this.createError.set(null);

      const routineData = this.routineStateService.getCompleteState();

      // Mapear los datos al formato requerido por la API
      const newRoutineBody: NewRoutineBody = {
        title: routineData.routineName,
        repeatDaysJson: this.mapDaysToNumbers(routineData.selectedDays),
        createTasks: this.mapTasksToRoutineTasks(routineData.tasks),
      };

      console.log('Datos de rutina antes del mapeo:', routineData);
      console.log('Días seleccionados:', routineData.selectedDays);
      console.log('Días mapeados a números:', this.mapDaysToNumbers(routineData.selectedDays));
      console.log('Body completo a enviar:', newRoutineBody);

      this.newRoutineService
        .createNewRoutine(newRoutineBody)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            console.log('Rutina creada exitosamente:', response);
            this.isCreatingRoutine.set(false);

            // Limpiar el estado después de crear la rutina
            this.routineStateService.resetState();

            // Navegar de vuelta al home o mostrar mensaje de éxito
            this.router.navigate(['/'], {
              queryParams: { created: 'true' },
            });
          },
          error: (error) => {
            console.error('Error al crear la rutina:', error);
            this.isCreatingRoutine.set(false);
            this.createError.set('Error al crear la rutina. Por favor, inténtalo de nuevo.');
          },
        });
    }
  }

  private mapDaysToNumbers(selectedDays: string[]): number[] {
    const dayMap: Record<string, number> = {
      // Mapeo en inglés (API format: Monday=1, Sunday=7)
      sunday: 7,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      // Mapeo en español (abreviaciones del DaySelectorComponent)
      dom: 7, // Domingo
      lun: 1, // Lunes
      mar: 2, // Martes
      mié: 3, // Miércoles
      jue: 4, // Jueves
      vie: 5, // Viernes
      sáb: 6, // Sábado
    };

    return selectedDays.map((day) => dayMap[day]).filter((num) => num !== undefined);
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

  private mapTasksToRoutineTasks(tasks: Task[]): NewRoutineTask[] {
    return tasks.map((task) => ({
      title: task.title,
      dateLocal: new Date().toISOString().split('T')[0], // Fecha actual como placeholder
      timeLocal: this.formatTimeToHHMMSS(task.dueTime),
      durationMin: task.duration,
      categoryId: task.category, // Ahora task.category ya contiene el ID
      priority: this.mapPriorityToEnum(task.priority),
      status: RoutineTaskStatus.PENDING,
      description: task.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
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
    }
  }
}
