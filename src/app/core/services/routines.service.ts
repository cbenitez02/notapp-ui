import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DailyTaskResponseResponse, RoutineResponse, RoutinesStatsResponse } from '../interfaces/routine.interface';
import { BaseRequestService } from './base-request.service';

interface UpdateTaskStatusResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoutinesService extends BaseRequestService {
  private readonly baseUrl = 'http://localhost:3000/routine';
  constructor() {
    super();
  }

  public getRoutines(): Observable<RoutineResponse[]> {
    return this.get<RoutineResponse[]>(`${this.baseUrl}/user/my-routines`);
  }

  public getRoutineById(id: string): Observable<RoutineResponse> {
    return this.get<RoutineResponse>(`${this.baseUrl}/${id}`);
  }

  public getRoutinesStats(): Observable<RoutinesStatsResponse> {
    return this.get<RoutinesStatsResponse>(`${this.baseUrl}/stats`);
  }

  public getTaskForToday(): Observable<DailyTaskResponseResponse> {
    return this.get<DailyTaskResponseResponse>(`${this.baseUrl}/tasks-for-day`);
  }

  public updateTaskStatus(taskId: string, status: string): Observable<UpdateTaskStatusResponse> {
    return this.put<UpdateTaskStatusResponse>(`${this.baseUrl}/tasks/${taskId}/status`, { status });
  }
}
