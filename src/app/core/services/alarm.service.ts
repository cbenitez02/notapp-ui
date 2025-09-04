import { Injectable, OnDestroy, signal } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { RoutinePriority, RoutineTaskResponseDto } from '../interfaces/routine.interface';
import { RoutineTaskStatus } from '../interfaces/task.interface';

// Declaración de tipos para compatibilidad con Web Audio API
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
    alarmService?: AlarmService;
  }
}

export interface AlarmConfig {
  enabled: boolean;
  sound: boolean;
  visual: boolean;
  minutes5Before: boolean;
  minutes1Before: boolean;
}

export interface AlarmNotification {
  id: string;
  task: RoutineTaskResponseDto;
  type: 'warning' | 'urgent'; // warning = 5 min, urgent = 1 min
  timestamp: Date;
  minutesUntilTask: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlarmService implements OnDestroy {
  private readonly alarmConfig = signal<AlarmConfig>({
    enabled: true,
    sound: true,
    visual: true,
    minutes5Before: true,
    minutes1Before: true,
  });

  private readonly tasks = signal<RoutineTaskResponseDto[]>([]);
  private alarmSubscription?: Subscription;
  private readonly notificationsSubject = new BehaviorSubject<AlarmNotification[]>([]);
  private audioContext?: AudioContext;
  private readonly urgentAlarmTimeouts: number[] = [];
  private activeUrgentAlarm: AlarmNotification | null = null;

  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.initializeAudioContext();
    this.startAlarmMonitoring();

    // Exponer para debug en desarrollo
    if (typeof window !== 'undefined') {
      window.alarmService = this;
    }
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not available:', error);
    }
  }

  public setTasks(tasks: RoutineTaskResponseDto[]): void {
    this.tasks.set(tasks);
  }

  public updateAlarmConfig(config: Partial<AlarmConfig>): void {
    this.alarmConfig.update((current) => ({ ...current, ...config }));
  }

  public getAlarmConfig(): AlarmConfig {
    return this.alarmConfig();
  }

  private startAlarmMonitoring(): void {
    // Verificar cada 15 segundos para mayor precisión
    this.alarmSubscription = interval(15000).subscribe(() => {
      this.checkForAlarms();
    });

    // Hacer una verificación inmediata al iniciar
    setTimeout(() => this.checkForAlarms(), 1000);
  }

  public forceCheckAlarms(): void {
    this.checkForAlarms();
  }

  public getTasks(): RoutineTaskResponseDto[] {
    return this.tasks();
  }

  public loadTestTasks(): void {
    const now = new Date();

    // Crear tareas de prueba con diferentes tiempos
    const testTasks: RoutineTaskResponseDto[] = [
      {
        id: 'test-task-1',
        routineId: 'routine-1',
        routineName: 'Test Routine',
        userId: 'user-1',
        title: 'Tarea en 1 minuto',
        dateLocal: now.toISOString().split('T')[0],
        timeLocal: new Date(now.getTime() + 1 * 60 * 1000).toTimeString().slice(0, 5),
        durationMin: 30,
        priority: RoutinePriority.ALTA,
        status: RoutineTaskStatus.PENDING,
        description: 'Tarea de prueba urgente',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test-task-2',
        routineId: 'routine-1',
        routineName: 'Test Routine',
        userId: 'user-1',
        title: 'Tarea en 5 minutos',
        dateLocal: now.toISOString().split('T')[0],
        timeLocal: new Date(now.getTime() + 5 * 60 * 1000).toTimeString().slice(0, 5),
        durationMin: 45,
        priority: RoutinePriority.MEDIA,
        status: RoutineTaskStatus.PENDING,
        description: 'Tarea de prueba normal',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'test-task-3',
        routineId: 'routine-1',
        routineName: 'Test Routine',
        userId: 'user-1',
        title: 'Tarea en 30 minutos',
        dateLocal: now.toISOString().split('T')[0],
        timeLocal: new Date(now.getTime() + 30 * 60 * 1000).toTimeString().slice(0, 5),
        durationMin: 60,
        priority: RoutinePriority.BAJA,
        status: RoutineTaskStatus.PENDING,
        description: 'Tarea de prueba futura',
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.setTasks(testTasks);
    console.log('🧪 Test tasks loaded:', testTasks.length);
    console.log('📋 Tasks details:');
    testTasks.forEach((task) => {
      console.log(`  - ${task.title} at ${task.timeLocal}`);
    });
  }

  public fixMissingDates(): void {
    const currentTasks = this.tasks();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const fixedTasks = currentTasks.map((task) => {
      if (!task.dateLocal) {
        return {
          ...task,
          dateLocal: today,
        };
      }
      return task;
    });

    this.setTasks(fixedTasks);
  }

  private isValidTask(
    task: RoutineTaskResponseDto,
  ): task is RoutineTaskResponseDto & { timeLocal: string; dateLocal: string } {
    return (
      task.status === 'pending' &&
      typeof task.timeLocal === 'string' &&
      typeof task.dateLocal === 'string' &&
      task.timeLocal.length > 0 &&
      task.dateLocal.length > 0
    );
  }

  private checkForAlarms(): void {
    const config = this.alarmConfig();
    if (!config.enabled) return;

    const now = new Date();
    const currentTasks = this.tasks();
    const pendingTasks = currentTasks.filter(this.isValidTask.bind(this));

    const notifications: AlarmNotification[] = [];

    pendingTasks.forEach((task) => {
      try {
        // Verificación adicional antes de llamar parseTaskTime
        if (!task.timeLocal || !task.dateLocal) {
          console.warn(`Task ${task.title} missing time data`, {
            timeLocal: task.timeLocal,
            dateLocal: task.dateLocal,
          });
          return;
        }

        // Force recompilation - safe parsing with null checks
        const taskTime = this.parseTaskTime(task.timeLocal, task.dateLocal);
        if (!taskTime) {
          console.warn(`Could not parse time for task: ${task.title}`, {
            timeLocal: task.timeLocal,
            dateLocal: task.dateLocal,
          });
          return;
        }

        const timeDiff = taskTime.getTime() - now.getTime();
        const minutesUntilTask = Math.floor(timeDiff / (1000 * 60));

        // Verificar alarma de 5 minutos - condición más precisa
        if (config.minutes5Before && minutesUntilTask <= 5 && minutesUntilTask > 3) {
          const alarmId = `${task.id}-5min`;
          if (!this.wasNotificationAlreadyTriggered(alarmId)) {
            notifications.push({
              id: alarmId,
              task,
              type: 'warning',
              timestamp: now,
              minutesUntilTask,
            });
          }
        }

        // Verificar alarma de 1 minuto - condición más precisa
        if (config.minutes1Before && minutesUntilTask <= 1 && minutesUntilTask >= 0) {
          const alarmId = `${task.id}-1min`;
          if (!this.wasNotificationAlreadyTriggered(alarmId)) {
            notifications.push({
              id: alarmId,
              task,
              type: 'urgent',
              timestamp: now,
              minutesUntilTask,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing alarm for task ${task.title}:`, error, { task });
      }
    });

    if (notifications.length > 0) {
      this.triggerAlarms(notifications);
    }
  }

  private parseTaskTime(timeLocal: string | undefined, dateLocal: string | undefined): Date | null {
    try {
      if (!timeLocal || !dateLocal) {
        console.warn('Missing timeLocal or dateLocal', { timeLocal, dateLocal });
        return null;
      }

      const timeParts = timeLocal.split(':');
      if (timeParts.length < 2 || timeParts.length > 3) {
        console.warn('Invalid timeLocal format, expected HH:MM or HH:MM:SS', { timeLocal });
        return null;
      }

      const [hours, minutes] = timeParts.map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn('Invalid hours or minutes in timeLocal', { timeLocal, hours, minutes });
        return null;
      }

      const dateParts = dateLocal.split('-');
      if (dateParts.length !== 3) {
        console.warn('Invalid dateLocal format, expected YYYY-MM-DD', { dateLocal });
        return null;
      }

      const [year, month, day] = dateParts.map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.warn('Invalid year, month, or day in dateLocal', { dateLocal, year, month, day });
        return null;
      }

      // Crear la fecha en la zona horaria local, no en UTC
      const taskDate = new Date(year, month - 1, day); // month es 0-indexed
      taskDate.setHours(hours, minutes, 0, 0);
      return taskDate;
    } catch (error) {
      console.error('Error parsing task time:', error);
      return null;
    }
  }

  public triggerAlarms(notifications: AlarmNotification[]): void {
    const config = this.alarmConfig();

    notifications.forEach((notification) => {
      // Verificar si ya se disparó esta notificación
      if (this.wasNotificationAlreadyTriggered(notification.id)) {
        return;
      }

      // Marcar la notificación como disparada inmediatamente
      this.markNotificationAsTriggered(notification.id);

      // Para alarmas urgentes, configurar como activa para sonido continuo
      if (notification.type === 'urgent') {
        console.log('🚨 Setting urgent alarm as active:', notification.id);
        this.activeUrgentAlarm = notification;
      }

      // Alarma sonora
      if (config.sound) {
        this.playAlarmSound(notification.type);
      }

      // Alarma visual
      if (config.visual) {
        this.showVisualNotification(notification);
      }
    });

    // Actualizar las notificaciones
    this.notificationsSubject.next([...this.notificationsSubject.value, ...notifications]);
  }

  private wasNotificationAlreadyTriggered(notificationId: string): boolean {
    const triggeredKey = `alarm_triggered_${notificationId}`;
    const triggered = localStorage.getItem(triggeredKey);
    const now = new Date();

    if (triggered) {
      const triggeredTime = new Date(triggered);
      // Si se disparó hace menos de 10 minutos, no disparar de nuevo
      // Esto evita que la misma alarma se dispare múltiples veces
      const timeDiff = now.getTime() - triggeredTime.getTime();
      return timeDiff < 10 * 60 * 1000; // 10 minutos
    }

    return false;
  }

  private markNotificationAsTriggered(notificationId: string): void {
    const triggeredKey = `alarm_triggered_${notificationId}`;
    localStorage.setItem(triggeredKey, new Date().toISOString());
  }

  private playAlarmSound(type: 'warning' | 'urgent'): void {
    if (!this.audioContext) return;

    console.log(`🔊 Playing ${type} alarm sound`);

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Diferentes tonos para diferentes tipos de alarma
      const frequency = type === 'urgent' ? 880 : 440; // La4 para urgente, La3 para advertencia
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Configurar el volumen (más bajo para evitar molestias)
      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      // Reproducir por 0.5 segundos (más corto)
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

      // Para alarmas urgentes, continuar sonando hasta ser confirmadas
      if (type === 'urgent' && this.activeUrgentAlarm) {
        const timeoutId = window.setTimeout(() => {
          this.playAlarmSound('urgent');
        }, 1500); // Repetir cada 1.5 segundos

        // Guardar el timeout ID para poder cancelarlo después
        this.urgentAlarmTimeouts.push(timeoutId);
      }
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }

  private showVisualNotification(notification: AlarmNotification): void {
    // Solicitar permisos de notificación si no los tenemos
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Mostrar notificación del navegador si tenemos permisos
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = notification.type === 'urgent' ? '⚠️ ¡Tarea próxima!' : '🔔 Recordatorio de tarea';

      const body =
        notification.type === 'urgent'
          ? `${notification.task.title} comienza en ${notification.minutesUntilTask} minuto(s)`
          : `${notification.task.title} comienza en ${notification.minutesUntilTask} minutos`;

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: notification.id, // Evita duplicados
      });
    }
  }

  public dismissNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value;
    const notification = notifications.find((n) => n.id === notificationId);

    // Si es una alarma urgente, detener el sonido antes de dismissar
    if (notification && notification.type === 'urgent' && this.activeUrgentAlarm?.id === notificationId) {
      this.stopUrgentAlarm();
    }

    const filtered = notifications.filter((n) => n.id !== notificationId);
    this.notificationsSubject.next(filtered);
  }

  private stopUrgentAlarm(): void {
    // Detener todos los timeouts pendientes
    if (this.urgentAlarmTimeouts.length > 0) {
      this.urgentAlarmTimeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      this.urgentAlarmTimeouts.length = 0; // Limpiar el array
    }

    // Limpiar la referencia de alarma activa
    this.activeUrgentAlarm = null;
    console.log('✅ Urgent alarm stopped');
  }

  public clearAllNotifications(): void {
    // Detener cualquier alarma urgente activa
    this.stopUrgentAlarm();

    this.notificationsSubject.next([]);
  }

  public confirmUrgentAlarm(): void {
    if (this.activeUrgentAlarm) {
      const alarmId = this.activeUrgentAlarm.id;

      // Detener el sonido continuo
      this.stopUrgentAlarm();

      // Remover la notificación de la lista directamente
      const notifications = this.notificationsSubject.value;
      const filtered = notifications.filter((n) => n.id !== alarmId);
      this.notificationsSubject.next(filtered);
    }
  }

  public hasActiveUrgentAlarm(): boolean {
    return this.activeUrgentAlarm !== null;
  }

  public clearTriggeredAlarmsCache(): void {
    // Limpiar todas las alarmas marcadas como disparadas en localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('alarm_triggered_')) {
        localStorage.removeItem(key);
      }
    });
  }

  public stopAlarmMonitoring(): void {
    if (this.alarmSubscription) {
      this.alarmSubscription.unsubscribe();
    }
  }

  public ngOnDestroy(): void {
    this.stopAlarmMonitoring();

    // Limpiar timeouts de alarma urgente si existen
    this.stopUrgentAlarm();

    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
