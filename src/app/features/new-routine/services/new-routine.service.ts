import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseRequestService } from '../../../core/services/base-request.service';
import { NewRoutineBody, NewRoutineResponse } from '../interfaces/new-routine.interface';

@Injectable({
  providedIn: 'root',
})
export class NewRoutineService extends BaseRequestService {
  private readonly baseUrl = 'http://localhost:3000/routine';
  constructor() {
    super();
  }

  public createNewRoutine(data: NewRoutineBody): Observable<NewRoutineResponse> {
    return this.post<NewRoutineResponse>(`${this.baseUrl}`, data);
  }
}
