import { Component, input, output, signal } from '@angular/core';
import { RoutineTaskResponseDto } from '../../../../core/interfaces/routine.interface';

@Component({
  selector: 'app-current-task',
  templateUrl: './current-task.component.html',
  styleUrls: ['./current-task.component.css'],
})
export class CurrentTaskComponent {
  public currentTask = input<RoutineTaskResponseDto | null>(null);
  public nextTask = input<RoutineTaskResponseDto | null>(null);

  // Outputs para comunicar acciones al componente padre
  public completeTask = output<RoutineTaskResponseDto>();
  public skipTask = output<RoutineTaskResponseDto>();

  // Estado para controlar la carga de los botones
  public isCompleting = signal(false);
  public isSkipping = signal(false);

  public formatTime(timeLocal?: string): string {
    if (!timeLocal) return '00:00';

    // Si el formato incluye segundos (HH:MM:SS), extraer solo HH:MM
    const timeParts = timeLocal.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }

    return timeLocal;
  }

  public onCompleteTask(): void {
    const task = this.currentTask();
    if (task && !this.isCompleting() && !this.isSkipping()) {
      this.isCompleting.set(true);
      this.completeTask.emit(task);
    }
  }

  public onSkipTask(): void {
    const task = this.currentTask();
    if (task && !this.isCompleting() && !this.isSkipping()) {
      this.isSkipping.set(true);
      this.skipTask.emit(task);
    }
  }

  // Método para resetear el estado de loading (llamado desde el padre)
  public resetLoadingState(): void {
    this.isCompleting.set(false);
    this.isSkipping.set(false);
  }
}
