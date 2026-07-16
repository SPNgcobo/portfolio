import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of, BehaviorSubject } from 'rxjs';
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

  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  user$ = this.userSubject.asObservable();

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/login`,
      request,
      { withCredentials: true }
    ).pipe(
      map(() => {
        this.loadUser();
        return { token: '', refreshToken: '', role: '' };
      })
    );
  }

  register(request: { username: string; email: string; password: string }): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/register`,
      request,
      { withCredentials: true }
    ).pipe(
      map(res => undefined)
    );
  }

  logout(): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      map(res => {
        this.clearUser();
        return undefined;
      })
    );
  }

  getMe(): Observable<UserInfo> {
    return this.http.get<ApiResponse<UserInfo>>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    ).pipe(
      map(res => res.data),
      tap(user => {
        this.currentUser = user;
        this.userSubject.next(user); 
      }),
      catchError(() => {
        this.currentUser = null;
        this.userSubject.next(null);
        return of({ email: '', role: '', username: '' });
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/forgot-password`,
      request
    ).pipe(
      map(res => undefined),
      catchError((error) => {
        console.error('Forgot password error:', error);
        throw error;
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/reset-password`,
      request
    ).pipe(
      map(res => {
        if (!res.success) {
          throw new Error(res.message || 'Failed to reset password');
        }
        return undefined;
      }),
      catchError((error) => {
        console.error('Reset password error:', error);
        const errorMessage = error.error?.message || error.message || 'Failed to reset password';
        throw new Error(errorMessage);
      })
    );
  }

  refreshToken(): Observable<boolean> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      map(() => {
        console.log('✅ Token refreshed successfully');
        this.loadUser();
        return true;
      }),
      catchError((error) => {
        console.error('❌ Refresh token failed:', error);
        this.clearUser();
        return of(false);
      })
    );
  }

  loadUser(): void {
    this.getMe().subscribe({
      next: (user) => {
        if (user && user.email) {
          this.currentUser = user;
          this.userSubject.next(user);
        }
      },
      error: () => {
        this.currentUser = null;
        this.userSubject.next(null);
      }
    });
  }

  clearUser(): void {
    this.currentUser = null;
    this.userSubject.next(null);
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null && !!this.currentUser.email;
  }

  getRole(): string | null {
    return this.currentUser?.role || null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ROLE_ADMIN';
  }

  clearAuthState(): void {
    this.clearUser();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  }
}