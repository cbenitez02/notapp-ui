import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateTaskRequest } from '../../../core/interfaces/task.interface';
import { BaseRequestService } from '../../../core/services/base-request.service';
import { RoutineTaskStatus } from '../../new-routine/interfaces/new-routine.interface';

@Injectable({
  providedIn: 'root',
})
export class NewTaskService extends BaseRequestService {
  private readonly baseUrl = environment.routineApiUrl;

  constructor() {
    super();
  }

  public createTask(routineId: string, taskData: CreateTaskRequest): Observable<void> {
    return this.post<void>(`${this.baseUrl}/${routineId}/tasks`, taskData);
  }

  public createMultipleTasks(routineId: string, taskData: CreateTaskRequest): Observable<void> {
    return this.post<void>(`${this.baseUrl}/${routineId}/tasks`, taskData);
  }

  public updateTaskStatus(status: RoutineTaskStatus, taskId: string): Observable<void> {
    return this.put<void>(`${this.baseUrl}/tasks/${taskId}/status`, { status });
  }
}
