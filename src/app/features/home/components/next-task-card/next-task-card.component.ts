import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { Task } from '../../../../core/interfaces/task.interface';

@Component({
  selector: 'app-next-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './next-task-card.component.html',
  styleUrls: ['./next-task-card.component.css'],
})
export class NextTaskCardComponent {
  // Signal para almacenar las tareas
  public tasks = signal<Task[]>([]);

  // Computed signal para verificar si hay tareas
  public hasTasks = computed(() => this.tasks().length > 0);

  // Computed signal para obtener las próximas 3 tareas
  public nextTasks = computed(() => {
    const allTasks = this.tasks().filter((task) => !task.completed);
    return allTasks.slice(0, 3);
  });

  constructor() {
    // Simular datos de ejemplo (en un caso real, esto vendría de un servicio)
    this.loadMockTasks();
  }

  private loadMockTasks(): void {
    // Datos de ejemplo para mostrar el componente
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Revisar emails matutinos',
        description: 'Revisar y responder emails importantes',
        completed: false,
        priority: 'high',
        dueTime: '09:00',
        category: 'Trabajo',
      },
      {
        id: '2',
        title: 'Reunión con el equipo',
        description: 'Reunión semanal de seguimiento',
        completed: false,
        priority: 'medium',
        dueTime: '10:30',
        category: 'Reuniones',
      },
      {
        id: '3',
        title: 'Almuerzo',
        description: 'Descanso para almorzar',
        completed: false,
        priority: 'low',
        dueTime: '12:00',
        category: 'Personal',
      },
    ];

    this.tasks.set(mockTasks);
  }
}
