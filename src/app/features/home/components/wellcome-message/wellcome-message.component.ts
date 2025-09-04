import { Component, effect, OnDestroy, signal } from '@angular/core';
import { PhaseDay } from '../../../../core/interfaces/days.interfaces';

@Component({
  selector: 'app-welcome-message',
  templateUrl: './wellcome-message.component.html',
  styleUrls: ['./wellcome-message.component.css'],
})
export class WellcomeMessageComponent implements OnDestroy {
  private phaseDayInterval?: number;
  public phaseDay = signal<PhaseDay>(this.getCurrentPhaseDay());
  public message = signal<string>(this.getMessageByPhase(this.getCurrentPhaseDay()));

  constructor() {
    // Actualizar la fase del día cada minuto
    this.updatePhaseDayPeriodically();

    // Effect para actualizar el mensaje cuando cambia la fase del día
    effect(() => {
      const currentPhase = this.phaseDay();
      this.message.set(this.getMessageByPhase(currentPhase));
    });
  }

  /**
   * Determina la fase del día basándose en la hora actual
   * @returns PhaseDay correspondiente a la hora actual
   */
  private getCurrentPhaseDay(): PhaseDay {
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 12) {
      return PhaseDay.MORNING; // 6:00 AM - 11:59 AM
    } else if (currentHour >= 12 && currentHour < 18) {
      return PhaseDay.AFTERNOON; // 12:00 PM - 5:59 PM
    } else {
      return PhaseDay.NIGHT; // 6:00 PM - 5:59 AM
    }
  }

  /**
   * Obtiene el mensaje correspondiente según la fase del día
   * @param phase Fase del día actual
   * @returns Mensaje de saludo correspondiente
   */
  private getMessageByPhase(phase: PhaseDay): string {
    switch (phase) {
      case PhaseDay.MORNING:
        return '☀️¡Buenos días!👋';
      case PhaseDay.AFTERNOON:
        return '🌤️¡Buenas tardes!👋';
      case PhaseDay.NIGHT:
        return '🌙¡Buenas noches!👋';
      default:
        return '¡Hola!';
    }
  }

  /**
   * Configura un intervalo para actualizar la fase del día periódicamente
   */
  private updatePhaseDayPeriodically(): void {
    // Actualizar inmediatamente
    this.phaseDay.set(this.getCurrentPhaseDay());

    // Actualizar cada minuto para capturar cambios de hora
    this.phaseDayInterval = window.setInterval(() => {
      const newPhase = this.getCurrentPhaseDay();
      if (this.phaseDay() !== newPhase) {
        this.phaseDay.set(newPhase);
        console.log('Phase day updated to:', newPhase);
        console.log('Message updated to:', this.message());
      }
    }, 60000); // 60,000 ms = 1 minuto
  }

  ngOnDestroy(): void {
    if (this.phaseDayInterval) {
      clearInterval(this.phaseDayInterval);
    }
  }

  /**
   * Método público para forzar actualización del mensaje (útil para testing)
   */
  public forceUpdateMessage(): void {
    const currentPhase = this.getCurrentPhaseDay();
    this.phaseDay.set(currentPhase);
    this.message.set(this.getMessageByPhase(currentPhase));
    console.log('Message manually updated to:', this.message());
  }

  /**
   * Método público para obtener el mensaje actual
   */
  public getCurrentMessage(): string {
    return this.message();
  }
}
