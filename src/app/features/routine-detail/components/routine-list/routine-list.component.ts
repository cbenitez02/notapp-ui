import { Component, input } from '@angular/core';
import { ICONS } from '../../../../core/constants/icons.constant';
import { RoutineResponse } from '../../../../core/interfaces/routine.interface';

@Component({
  selector: 'app-routine-list',
  templateUrl: './routine-list.component.html',
  styleUrls: ['./routine-list.component.css'],
})
export class RoutineListComponent {
  public routines = input<RoutineResponse[]>([]);

  public getDaysText(repeatDaysJson: number[]): string {
    const daysMap: Record<number, string> = {
      0: 'Dom',
      1: 'Lun',
      2: 'Mar',
      3: 'Mié',
      4: 'Jue',
      5: 'Vie',
      6: 'Sáb',
    };

    if (repeatDaysJson.length === 7) {
      return 'Todos los días';
    }

    if (repeatDaysJson.length === 0) {
      return 'Ningún día';
    }

    const sortedDays = [...repeatDaysJson].sort((a, b) => a - b);
    return sortedDays.map((day) => daysMap[day]).join(', ');
  }

  public formatTime(timeLocal?: string): string {
    if (!timeLocal) return '';

    const timeParts = timeLocal.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }

    return timeLocal;
  }

  public getRoutineIcon(routine: RoutineResponse): string {
    // Si la rutina tiene un icono definido (ID)
    if (routine.icon) {
      // Buscar el icono en la constante ICONS por ID
      const iconData = ICONS.find((icon) => icon.id === routine.icon);

      if (iconData) {
        // Extraer solo el nombre del archivo del path completo
        // De "/assets/icons/icon-star.svg" extraer "icon-star"
        const iconPath = iconData.icon;
        const iconName = iconPath.split('/').pop()?.replace('.svg', '') || '';
        return iconName;
      }
    }

    // Icono por defecto si no se encuentra el icono especificado
    return 'icon-tasks';
  }

  public onIconError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  public onViewRoutineDetail(routine: RoutineResponse): void {
    // Implementar navegación al detalle de la rutina
    console.log('Ver detalle de rutina:', routine.id, routine.title);
  }
}
