import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { Day } from './interfaces/day-selector.interfaces';

@Component({
  selector: 'app-day-selector',
  imports: [CommonModule],
  templateUrl: './day-selector.component.html',
  styleUrls: ['./day-selector.component.css'],
})
export class DaySelectorComponent {
  selectedDays = input<string[]>([]);
  disabled = input<boolean>(false);
  selectedDaysChange = output<string[]>();

  // Signal para manejar los días
  private readonly daysSignal = signal<Day[]>([
    { name: 'Lunes', abbreviation: 'Lun', selected: false },
    { name: 'Martes', abbreviation: 'Mar', selected: false },
    { name: 'Miércoles', abbreviation: 'Mié', selected: false },
    { name: 'Jueves', abbreviation: 'Jue', selected: false },
    { name: 'Viernes', abbreviation: 'Vie', selected: false },
    { name: 'Sábado', abbreviation: 'Sáb', selected: false },
    { name: 'Domingo', abbreviation: 'Dom', selected: false },
  ]);

  // Computed signal para exponer los días
  days = computed(() => this.daysSignal());

  // Computed signal para obtener el texto de días seleccionados
  selectedDaysText = computed(() => {
    const selectedDayNames = this.daysSignal()
      .filter((day: Day) => day.selected)
      .map((day: Day) => day.name);

    if (selectedDayNames.length === 0) {
      return 'Ningún día seleccionado';
    }

    return `Seleccionados: ${selectedDayNames.join(', ')}`;
  });

  constructor() {
    // Effect para reaccionar a cambios en selectedDays input
    effect(
      () => {
        const selectedDaysInput = this.selectedDays();
        // Solo actualizar si realmente hay cambios significativos
        const currentSelectedDays = untracked(() =>
          this.daysSignal()
            .filter((day) => day.selected)
            .map((day) => day.abbreviation.toLowerCase()),
        );

        // Verificar si hay diferencias reales antes de actualizar
        const hasChanges =
          selectedDaysInput.length !== currentSelectedDays.length ||
          selectedDaysInput.some((day) => !currentSelectedDays.includes(day));

        if (hasChanges) {
          this.updateDaysSelection(selectedDaysInput);
        }
      },
      { allowSignalWrites: true },
    );
  }

  private updateDaysSelection(selectedDaysInput: string[]) {
    const currentDays = this.daysSignal();
    const updatedDays = currentDays.map((day: Day) => ({
      ...day,
      selected: selectedDaysInput.includes(day.abbreviation.toLowerCase()),
    }));
    this.daysSignal.set(updatedDays);
  }

  toggleDay(day: Day) {
    // No permitir toggle si está deshabilitado
    if (this.disabled()) {
      return;
    }

    const currentDays = this.daysSignal();
    const updatedDays = currentDays.map((d: Day) =>
      d.abbreviation === day.abbreviation ? { ...d, selected: !d.selected } : d,
    );
    this.daysSignal.set(updatedDays);

    // Usar setTimeout para evitar ejecuciones múltiples inmediatas
    setTimeout(() => {
      this.updateSelectedDays();
    }, 0);
  }

  private updateSelectedDays() {
    const selected = this.daysSignal()
      .filter((day: Day) => day.selected)
      .map((day: Day) => day.abbreviation.toLowerCase());

    this.selectedDaysChange.emit(selected);
  }
}
