import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, OnDestroy, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ICONS } from '../../../../core/constants/icons.constant';
import { RoutineStateService } from '../../services/routine-state.service';
import { DaySelectorComponent } from '../day-selector/day-selector.component';

// Validador personalizado para días seleccionados
function daysSelectedValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return { required: true };
  }
  return null;
}

@Component({
  selector: 'app-routine-form',
  templateUrl: './routine-form.component.html',
  styleUrls: ['./routine-form.component.css'],
  imports: [DaySelectorComponent, ReactiveFormsModule, FormsModule, CommonModule],
})
export class RoutineFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly routineStateService = inject(RoutineStateService);
  private readonly destroy$ = new Subject<void>();
  private readonly elementRef = inject(ElementRef);

  // Signal para el nombre de la rutina
  private readonly routineNameSignal = signal('');

  // Propiedades para el select personalizado
  isDropdownOpen = false;
  selectedIconOption: { id: number; label: string; icon: string } | null = null;

  // Computed signal para determinar si el selector de días está deshabilitado
  isDaySelectorDisabled = computed(() => {
    const routineName = this.routineNameSignal().trim();
    return routineName.length < 3; // Deshabilitar si el nombre tiene menos de 3 caracteres
  });

  // Opciones de iconos disponibles
  public iconOptions = ICONS;

  public routineForm: FormGroup = this.fb.group({
    routineName: ['', [Validators.required, Validators.minLength(3)]],
    routineIcon: [this.iconOptions[0].id, [Validators.required]],
    selectedDays: [[] as string[], [daysSelectedValidator]],
  });

  constructor() {
    // Inicializar con el primer icono seleccionado
    this.selectedIconOption = this.iconOptions[0];

    // Escuchar cambios en el formulario y actualizar el servicio
    this.routineForm
      .get('routineName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: string) => {
        const routineName = value || '';
        this.routineNameSignal.set(routineName);
        this.routineStateService.updateRoutineName(routineName);
      });

    this.routineForm
      .get('routineIcon')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        // Aquí puedes agregar lógica para manejar el cambio de icono si es necesario
        console.log('Icon selected:', value);
      });

    this.routineForm
      .get('selectedDays')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value: string[]) => {
        this.routineStateService.updateSelectedDays(value || []);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectedDaysChange(selectedDays: string[]) {
    if (this.routineForm) {
      this.routineForm.patchValue({ selectedDays });
      // Marcar el campo como tocado para mostrar validaciones
      this.routineForm.get('selectedDays')?.markAsTouched();
    }
  }

  // Método para marcar todos los campos como tocados
  markAllFieldsAsTouched(): void {
    this.routineForm.markAllAsTouched();
  }

  onSubmit() {
    if (this.routineForm.valid) {
      console.log('Form submitted:', this.routineForm.value);
      console.log('Complete state:', this.routineStateService.getCompleteState());
    } else {
      console.log('Form is invalid');
      this.markAllFieldsAsTouched();
    }
  }

  // Métodos para el select personalizado
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectIcon(iconOption: { id: number; label: string; icon: string }) {
    this.selectedIconOption = iconOption;
    this.routineForm.patchValue({ routineIcon: iconOption.id });
    this.routineForm.get('routineIcon')?.markAsTouched();
    this.isDropdownOpen = false;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isDropdownOpen = false;
    }
  }
}
