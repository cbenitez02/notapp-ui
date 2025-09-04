import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-routine-header',
  templateUrl: './routine-header.component.html',
  styleUrls: ['./routine-header.component.css'],
})
export class RoutineHeaderComponent implements OnInit, OnDestroy {
  currentDate = '';
  currentTime = '';
  private timeInterval: ReturnType<typeof setInterval> | null = null;
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.updateDateTime();
    // Update time every minute
    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateDateTime(): void {
    const now = new Date();

    // Format date: "Viernes, 29 De Agosto De 2025"
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    this.currentDate = `${dayName}, ${day} De ${monthName} De ${year}`;

    // Format time: "13:44"
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }

  public onNewTask(): void {
    this.router.navigate(['/new-task'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  public onNewRoutine(): void {
    this.router.navigate(['/new-routine'], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}
