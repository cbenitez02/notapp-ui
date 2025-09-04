import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetUserByIdResponse } from '../interfaces/users.interface';
import { BaseRequestService } from './base-request.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseRequestService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor() {
    super();
  }

  public getUserById(userId: string): Observable<GetUserByIdResponse> {
    return this.get<GetUserByIdResponse>(`${this.baseUrl}/users/${userId}`);
  }
}
