import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryResponse } from '../interfaces/categories.interfaces';
import { BaseRequestService } from './base-request.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends BaseRequestService {
  private readonly baseUrl = 'http://localhost:3000/category';

  constructor() {
    super();
  }

  public getCategories(): Observable<CategoryResponse[]> {
    return this.get<CategoryResponse[]>(`${this.baseUrl}`);
  }
}
