import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlarmNotification, AlarmService } from '../../../core/services/alarm.service';

@Component({
  selector: 'app-alarm-notifications',
  standalone: true,
  imports: [],
  templateUrl: './alarm-notifications.component.html',
  styleUrls: ['./alarm-notifications.component.css'],
})
export class AlarmNotificationsComponent implements OnInit, OnDestroy {
  private readonly alarmService = inject(AlarmService);
  private readonly destroy$ = new Subject<void>();

  public notifications: AlarmNotification[] = [];

  ngOnInit(): void {
    this.alarmService.notifications$.pipe(takeUntil(this.destroy$)).subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public dismissNotification(notificationId: string): void {
    console.log('🗑️ Dismissing notification:', notificationId);
    this.alarmService.dismissNotification(notificationId);
  }

  public confirmUrgentAlarm(): void {
    console.log('✅ Button clicked - Confirming urgent alarm');
    this.alarmService.confirmUrgentAlarm();
  }

  public onConfirmButtonMouseDown(event: Event): void {
    console.log('🖱️ Mouse down on confirm button', event);
    console.log('🎯 Event target:', event.target);
    console.log('🎯 Event currentTarget:', event.currentTarget);
    event.preventDefault();
    event.stopPropagation();
    this.confirmUrgentAlarm();
  }

  public onConfirmButtonTouch(event: Event): void {
    console.log('👆 Touch on confirm button', event);
    console.log('🎯 Event target:', event.target);
    console.log('🎯 Event currentTarget:', event.currentTarget);
    event.preventDefault();
    event.stopPropagation();
    this.confirmUrgentAlarm();
  }

  public console = console; // Exponer console al template para debug
}
