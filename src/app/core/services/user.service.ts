import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GetUserByIdResponse } from '../interfaces/users.interface';
import { BaseRequestService } from './base-request.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends BaseRequestService {
  private readonly baseUrl = environment.apiUrl;

  constructor() {
    super();
  }

  public getUserById(userId: string): Observable<GetUserByIdResponse> {
    return this.get<GetUserByIdResponse>(`${this.baseUrl}/users/${userId}`);
  }
}
