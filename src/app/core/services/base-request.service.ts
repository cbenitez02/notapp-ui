import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BaseRequestService {
  private readonly http = inject(HttpClient);

  /**
   *
   * @template T
   * @param {string} url
   * @param {HttpParams} [params=new HttpParams()]
   * @return {*}  {Observable<T>}
   * @memberof BaseRequestService
   */
  public get<T>(url: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(url, { params, withCredentials: true }).pipe(catchError(this.handleError));
  }

  /**
   *
   * @template T
   * @param {string} url
   * @param {object} body
   * @param {HttpHeaders} [headers]
   * @return {*}  {Observable<T>}
   * @memberof BaseRequestService
   */
  public post<T>(url: string, body: object, headers?: HttpHeaders): Observable<T> {
    const options: { headers?: HttpHeaders; withCredentials: boolean } = { withCredentials: true };
    if (headers) {
      options.headers = headers;
    }
    return this.http.post<T>(url, body, options).pipe(catchError(this.handleError));
  }

  /**
   *
   * @template T
   * @param {string} url
   * @param {object} body
   * @return {*}  {Observable<T>}
   * @memberof BaseRequestService
   */
  public put<T>(url: string, body: object): Observable<T> {
    return this.http.put<T>(url, body, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  /**
   * @template T
   * @param {string} url
   * @param {object} body
   * @return {*}  {Observable<T>}
   * @memberof BaseRequestService
   */
  public patch<T>(url: string, body: object): Observable<T> {
    return this.http.patch<T>(url, body, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  /**
   *
   * @template T
   * @param {string} url
   * @param {HttpParams} [params=new HttpParams()]
   * @return {*}  {Observable<T>}
   * @memberof BaseRequestService
   */
  public delete<T>(url: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.delete<T>(url, { params, withCredentials: true }).pipe(catchError(this.handleError));
  }

  /**
   * @private
   * @param {*} errorResponse
   * @return {*}
   * @memberof BaseRequestService
   */
  private handleError(errorResponse: unknown): Observable<never> {
    return throwError(() => errorResponse);
  }
}
