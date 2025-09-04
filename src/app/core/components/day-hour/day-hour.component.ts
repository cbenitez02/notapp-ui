import { Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-day-hour',
  templateUrl: './day-hour.component.html',
  styleUrls: ['./day-hour.component.css'],
})
export class DayHourComponent implements OnInit, OnDestroy {
  public day = signal<string>(this.getCurrentDay());
  public hour = signal<string>(this.getCurrentHour());
  private intervalId?: number;

  ngOnInit(): void {
    // Actualizar cada segundo
    this.intervalId = window.setInterval(() => {
      this.day.set(this.getCurrentDay());
      this.hour.set(this.getCurrentHour());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private getCurrentDay(): string {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    } as const;
    return new Intl.DateTimeFormat('es-ES', options).format(new Date());
  }

  private getCurrentHour(): string {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    } as const;
    return new Intl.DateTimeFormat('es-ES', options).format(new Date());
  }
}
