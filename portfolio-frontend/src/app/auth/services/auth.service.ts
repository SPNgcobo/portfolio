import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  private currentUser: CurrentUser | null = null;

  constructor(private http: HttpClient) { }

  login(request: any): Observable<any> {

    return this.http.post(
      `${this.api}/login`,
      request,
      { withCredentials: true }
    );
  }

  logout(): Observable<any> {

    return this.http.post(
      `${this.api}/logout`,
      {},
      { withCredentials: true }
    );
  }

  getMe(): Observable<CurrentUser> {

    return this.http.get<any>(
      `${this.api}/me`,
      { withCredentials: true }
    ).pipe(
      map(res => res.data as CurrentUser)
    );
  }

  loadUser(): void {

    this.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: () => {
        this.currentUser = null;
      }
    });
  }

  getRole(): string | null {
    return this.currentUser?.role || null;
  }

  isAdminSync(): boolean {
    return this.currentUser?.role === 'ROLE_ADMIN';
  }
}