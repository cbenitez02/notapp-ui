import { Component, input } from '@angular/core';
import { RoutinesStatsResponse } from '../../../../core/interfaces/routine.interface';

@Component({
  selector: 'app-personal-stats',
  templateUrl: './personal-stats.component.html',
  styleUrls: ['./personal-stats.component.css'],
})
export class PersonalStatsComponent {
  public stats = input<RoutinesStatsResponse | null>();
}
