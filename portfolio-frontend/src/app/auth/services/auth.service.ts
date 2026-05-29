import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, tap } from 'rxjs';

import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';

import { LoginRequest } from '../models/login-request.model';
import { LoginApiResponse } from '../models/login-api-response.model';

import { JwtPayload } from '../../core/models/jwt-payload.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  login(request: LoginRequest): Observable<LoginApiResponse> {

    return this.http.post<LoginApiResponse>(
      `${this.api}/login`,
      request
    ).pipe(
      tap((res) => {

        const data = res.data;

        localStorage.setItem('token', data.token);

        localStorage.setItem(
          'refreshToken',
          data.refreshToken
        );

        localStorage.setItem(
          'role',
          data.role
        );
      })
    );
  }

  getToken(): string | null {

    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {

    return localStorage.getItem('refreshToken');
  }

  getRole(): string | null {

    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {

    return !!this.getToken();
  }

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('refreshToken');

    localStorage.removeItem('role');
  }

  getDecodedToken(): JwtPayload | null {

    const token = this.getToken();

    if (!token) return null;

    try {

      return jwtDecode<JwtPayload>(token);

    } catch {

      return null;
    }
  }

  getUserRole(): string | null {

    const decoded = this.getDecodedToken();

    return decoded?.role || null;
  }

  isAdmin(): boolean {

    return this.getUserRole() === 'ADMIN';
  }
}