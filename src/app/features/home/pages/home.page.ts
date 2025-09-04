import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlarmSettingsComponent } from '../../../core/components/alarm-settings/alarm-settings.component';
import { DayHourComponent } from '../../../core/components/day-hour/day-hour.component';
import { Routes } from '../../../core/constants/routes.constant';
import { DailyTaskResponseResponse, RoutinesStatsResponse } from '../../../core/interfaces/routine.interface';
import { AlarmService } from '../../../core/services/alarm.service';
import { RoutinesService } from '../../../core/services/routines.service';
import { UserService } from '../../../core/services/user.service';
import { AuthenticationService } from '../../auth/services/authentication.service';
import { ActionButtonsComponent } from '../components/action-buttons/action-buttons.component';
import { NoDataResultsComponent } from '../components/no-data-results/no-data-results.component';
import { PersonalStatsComponent } from '../components/personal-stats/personal-stats.component';
import { WellcomeMessageComponent } from '../components/wellcome-message/wellcome-message.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
  imports: [
    WellcomeMessageComponent,
    DayHourComponent,
    PersonalStatsComponent,
    ActionButtonsComponent,
    NoDataResultsComponent,
    AlarmSettingsComponent,
  ],
})
export class HomePage implements OnDestroy {
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly routinesService = inject(RoutinesService);
  private readonly alarmService = inject(AlarmService);
  private readonly destroy$ = new Subject<void>();

  // Signals para el estado del componente
  public userName = signal<string | null>(null);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // Computed signal para verificar si hay datos de usuario válidos
  public hasUserData = computed(() => !!this.userName() && !this.isLoading());

  public routinesStats = signal<RoutinesStatsResponse | null>(null);
  public dailyTasks = signal<DailyTaskResponseResponse | null>(null);

  constructor() {
    // Effect que se ejecuta cuando cambia el usuario autenticado
    effect(() => {
      this.loadRoutineStats();
      this.loadDailyTasks();
    });
  }

  public loadDailyTasks(): void {
    this.routinesService
      .getTaskForToday()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dailyTasks) => {
          console.log('Daily tasks loaded:', dailyTasks);
          this.dailyTasks.set(dailyTasks);

          // Configurar alarmas para las tareas del día
          if (dailyTasks.tasks && dailyTasks.tasks.length > 0) {
            this.alarmService.setTasks(dailyTasks.tasks);
          }
        },
        error: (error) => {
          console.error('Error loading daily tasks:', error);
        },
      });
  }

  public loadRoutineStats(): void {
    this.routinesService
      .getRoutinesStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.routinesStats.set(stats);
        },
        error: (error) => {
          console.error('Error loading routine stats:', error);
        },
      });
  }

  public loadUserData(): void {
    // Implementation needed
  }

  public logout(): void {
    this.isLoading.set(true);

    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeToken();
        this.authService.removeRefreshToken();
        this.userName.set(null);
        this.isLoading.set(false);
        this.router.navigate([Routes.LOGIN]);
      },
      error: (error) => {
        console.error('Logout failed', error);
        this.errorMessage.set('Logout failed');
        this.isLoading.set(false);
      },
    });
  }

  public refresh(): void {
    this.isLoading.set(true);

    this.authService.refreshToken().subscribe({
      next: () => {
        this.isLoading.set(false);
        // Reload user data after refresh
        this.loadUserData();
      },
      error: () => {
        this.errorMessage.set('Refresh failed');
        this.isLoading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
