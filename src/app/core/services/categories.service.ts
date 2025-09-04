import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryResponse } from '../interfaces/categories.interfaces';
import { BaseRequestService } from './base-request.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends BaseRequestService {
  private readonly baseUrl = environment.categoryApiUrl;

  constructor() {
    super();
  }

  public getCategories(): Observable<CategoryResponse[]> {
    return this.get<CategoryResponse[]>(`${this.baseUrl}`);
  }
}
