import { Component, DestroyRef, inject, InjectionToken, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryResponse } from '../../interfaces/categories.interfaces';
import { TaskStateInterface } from '../../interfaces/task-state.interface';
import { Task } from '../../interfaces/task.interface';
import { CategoriesService } from '../../services/categories.service';

// Token de inyección para el servicio de estado de tareas
export const TASK_STATE_SERVICE = new InjectionToken<TaskStateInterface>('TaskStateService');

@Component({
  selector: 'app-shared-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './shared-task-form.component.html',
  styleUrls: ['./shared-task-form.component.css'],
})
export class SharedTaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskStateService = inject(TASK_STATE_SERVICE);

  taskForm: FormGroup;

  // Signals para manejo reactivo de categorías
  categories = signal<CategoryResponse[]>([]);
  isLoadingCategories = signal<boolean>(false);
  categoriesError = signal<string | null>(null);

  priorities = [
    { value: 'high', label: 'Alta', color: 'error' },
    { value: 'medium', label: 'Media', color: 'warning' },
    { value: 'low', label: 'Baja', color: 'success' },
  ];

  constructor() {
    this.taskForm = this.fb.group({
      taskName: ['', [Validators.required, Validators.maxLength(100)]],
      dueTime: ['', Validators.required],
      duration: ['30', [Validators.required, Validators.min(1), Validators.max(1440)]], // máximo 24 horas
      category: ['', Validators.required], // Inicializamos vacío hasta cargar categorías
      priority: ['medium', Validators.required],
      description: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoadingCategories.set(true);
    this.categoriesError.set(null);

    this.categoriesService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categoriesResponse) => {
          this.categories.set(categoriesResponse);
          // Si hay categorías disponibles, establece la primera como valor por defecto
          if (categoriesResponse.length > 0) {
            const defaultCategory = categoriesResponse.find((cat) => cat.name === 'Trabajo') || categoriesResponse[0];
            this.taskForm.patchValue({ category: defaultCategory.name });
          }
          this.isLoadingCategories.set(false);
        },
        error: (error) => {
          this.categoriesError.set('Error al cargar las categorías');
          console.error('Error loading categories:', error);
          this.isLoadingCategories.set(false);
        },
      });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      // Encontrar la categoría seleccionada para obtener su ID
      const selectedCategoryName = this.taskForm.value.category;
      const selectedCategory = this.categories().find((cat) => cat.name === selectedCategoryName);

      const task: Task = {
        id: this.generateId(),
        title: this.taskForm.value.taskName,
        description: this.taskForm.value.description,
        completed: false,
        priority: this.taskForm.value.priority,
        dueTime: this.taskForm.value.dueTime,
        category: selectedCategory?.id || selectedCategoryName, // Usar el ID si está disponible
        duration: parseInt(this.taskForm.value.duration, 10),
      };

      this.taskStateService.addTask(task);
      this.resetForm();
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.taskForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    const defaultCategory =
      this.categories().length > 0
        ? (this.categories().find((cat) => cat.name === 'Trabajo') || this.categories()[0]).name
        : 'Trabajo';

    this.taskForm.reset({
      taskName: '',
      dueTime: '',
      duration: '30',
      category: defaultCategory,
      priority: 'medium',
      description: '',
    });
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Getters para facilitar el acceso a los controles del formulario
  get taskName() {
    return this.taskForm.get('taskName');
  }

  get dueTime() {
    return this.taskForm.get('dueTime');
  }

  get duration() {
    return this.taskForm.get('duration');
  }

  get category() {
    return this.taskForm.get('category');
  }

  get priority() {
    return this.taskForm.get('priority');
  }

  get description() {
    return this.taskForm.get('description');
  }
}
