import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseRequestService } from '../../../core/services/base-request.service';
import {
  LoginBody,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterBody,
  RegisterResponse,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService extends BaseRequestService {
  private readonly baseUrl = environment.authApiUrl;
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor() {
    super();
  }

  public login(body: LoginBody): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      credentials: 'include',
    });
    return this.post<LoginResponse>(`${this.baseUrl}/login`, body, headers);
  }

  public register(body: RegisterBody): Observable<RegisterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      credentials: 'include',
    });
    return this.post<RegisterResponse>(`${this.baseUrl}/register`, body, headers);
  }

  public logout(): Observable<LogoutResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      credentials: 'include',
    });
    return this.post<LogoutResponse>(`${this.baseUrl}/logout`, {}, headers);
  }

  public refreshToken(): Observable<RefreshTokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      credentials: 'include',
    });
    return this.post<RefreshTokenResponse>(`${this.baseUrl}/refresh`, {}, headers);
  }

  public setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  public setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  public removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  public isTokenExpired(token?: string): boolean {
    const currentToken = token || this.getToken();
    if (!currentToken) {
      return true;
    }

    try {
      // Decodificar el payload del JWT (parte del medio)
      const payload = JSON.parse(atob(currentToken.split('.')[1]));

      // Verificar si tiene el campo 'exp' (expiration time)
      if (!payload.exp) {
        return true;
      }

      // Comparar con el tiempo actual (exp está en segundos, Date.now() en milisegundos)
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch {
      return true;
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    // Si el token está expirado, limpiarlo y retornar false
    if (this.isTokenExpired(token)) {
      this.removeToken();
      return false;
    }

    return true;
  }

  public isEmailVerified(): boolean {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.emailVerified === true;
    } catch {
      return false;
    }
  }

  public isFullyAuthenticated(): boolean {
    return this.isAuthenticated() && this.isEmailVerified();
  }

  public getUserId(): string | null {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }
}
