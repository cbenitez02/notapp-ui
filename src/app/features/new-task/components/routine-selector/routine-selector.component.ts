import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoutineResponse } from '../../../../core/interfaces/routine.interface';
import { RoutinesService } from '../../../../core/services/routines.service';
import { TaskStateService } from '../../services/task-state.service';

interface RoutineOption {
  id: string;
  title: string;
  fullData?: RoutineResponse;
}

@Component({
  selector: 'app-routine-selector',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './routine-selector.component.html',
  styleUrls: ['./routine-selector.component.css'],
})
export class RoutineSelectorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskStateService = inject(TaskStateService);
  private readonly routinesService = inject(RoutinesService);
  private readonly destroyRef = inject(DestroyRef);

  routineForm: FormGroup;

  // Signals para manejo reactivo de rutinas
  routines = signal<RoutineOption[]>([]);
  isLoadingRoutines = signal<boolean>(false);
  routinesError = signal<string | null>(null);

  constructor() {
    this.routineForm = this.fb.group({
      selectedRoutine: ['', Validators.required],
    });

    // Suscribirse a cambios del formulario
    this.routineForm.get('selectedRoutine')?.valueChanges.subscribe((value) => {
      this.taskStateService.updateSelectedRoutine(value);
      this.loadRoutineDetails(value);
    });
  }

  ngOnInit(): void {
    this.loadRoutines();
  }

  private loadRoutines(): void {
    this.isLoadingRoutines.set(true);
    this.routinesError.set(null);

    this.routinesService
      .getRoutines()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (routinesResponse: RoutineResponse[]) => {
          // Mapear las rutinas a opciones simples pero guardar la data completa
          const routineOptions: RoutineOption[] = routinesResponse.map((routine: RoutineResponse) => ({
            id: routine.id,
            title: routine.title,
            fullData: routine,
          }));

          this.routines.set(routineOptions);

          this.isLoadingRoutines.set(false);
        },
        error: (error: unknown) => {
          this.routinesError.set('Error al cargar las rutinas');
          console.error('Error loading routines:', error);
          this.isLoadingRoutines.set(false);
        },
      });
  }

  refreshRoutines(): void {
    this.loadRoutines();
  }

  private loadRoutineDetails(routineTitle: string): void {
    if (!routineTitle) {
      this.taskStateService.updateSelectedRoutineData(null);
      return;
    }

    const selectedRoutine = this.routines().find((routine) => routine.title === routineTitle);
    if (selectedRoutine?.fullData) {
      this.taskStateService.updateSelectedRoutineData(selectedRoutine.fullData);
    } else if (selectedRoutine?.id) {
      // Si no tenemos la data completa, cargarla del servidor
      this.routinesService
        .getRoutineById(selectedRoutine.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (routineData) => {
            this.taskStateService.updateSelectedRoutineData(routineData);
          },
          error: (error) => {
            console.error('Error loading routine details:', error);
            this.taskStateService.updateSelectedRoutineData(null);
          },
        });
    }
  }

  // Getter para facilitar el acceso al control del formulario
  get selectedRoutine() {
    return this.routineForm.get('selectedRoutine');
  }
}
