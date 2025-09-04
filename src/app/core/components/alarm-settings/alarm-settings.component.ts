import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { AlarmConfig, AlarmService } from '../../../core/services/alarm.service';

// Declaración de tipos para compatibilidad con Web Audio API
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

@Component({
  selector: 'app-alarm-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alarm-settings.component.html',
  styleUrls: ['./alarm-settings.component.css'],
})
export class AlarmSettingsComponent implements OnInit, OnDestroy {
  private readonly alarmService = inject(AlarmService);
  private readonly destroy$ = new Subject<void>();

  public alarmConfig: AlarmConfig = {
    enabled: true,
    sound: true,
    visual: true,
    minutes5Before: true,
    minutes1Before: true,
  };

  public showSettings = false;

  ngOnInit(): void {
    this.alarmConfig = this.alarmService.getAlarmConfig();
    this.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  public updateConfig(): void {
    this.alarmService.updateAlarmConfig(this.alarmConfig);
  }

  public testAlarm(): void {
    // Simular alarma sonora si está habilitada
    if (this.alarmConfig.sound) {
      this.playTestSound();
    }

    // Simular notificación visual si está habilitada
    if (this.alarmConfig.visual) {
      this.showTestNotification();
    }
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notificaciones habilitadas');
        }
      });
    }
  }

  private playTestSound(): void {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing test sound:', error);
    }
  }

  private showTestNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Prueba de alarma', {
        body: 'Esta es una notificación de prueba del sistema de alarmas',
        icon: '/favicon.ico',
        tag: 'test-alarm',
      });
    }
  }
}
