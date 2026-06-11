import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';
import { UserInfo } from '../models/user-info';
import { ForgotPasswordRequest } from '../models/forgot-password';
import { ResetPasswordRequest } from '../models/reset-password';
import type { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUser: UserInfo | null = null;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/login`,
      request,
      { withCredentials: true }
    ).pipe(
      map(() => {
        return { token: '', refreshToken: '', role: '' };
      })
    );
  }

  register(request: { username: string; email: string; password: string }): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/register`,
      request,
      { withCredentials: true }
    ).pipe(map(res => undefined));
  }

  logout(): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(map(res => undefined));
  }

  getMe(): Observable<UserInfo> {
    return this.http.get<ApiResponse<UserInfo>>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    ).pipe(
      map(res => res.data),
      tap(user => this.currentUser = user)
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/forgot-password`,
      request
    ).pipe(map(res => undefined));
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/reset-password`,
      request
    ).pipe(map(res => undefined));
  }

  refreshToken(): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(map(res => undefined));
  }

  loadUser(): void {
    this.getMe().subscribe({
      next: (user) => this.currentUser = user,
      error: () => this.currentUser = null
    });
  }

  clearUser(): void {
    this.currentUser = null;
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getRole(): string | null {
    return this.currentUser?.role || null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ROLE_ADMIN';
  }
}