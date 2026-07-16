import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationDisplayService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  getActiveNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}/active`
    );
  }

  getUserNotifications(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/user/me`,
      { withCredentials: true }
    );
  }

  getUserUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/user/me/unread/count`,
      { withCredentials: true }
    );
  }

  markUserNotificationsAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/user/me/read/all`,
      {},
      { withCredentials: true }
    );
  }

  markUserNotificationAsRead(id: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/user/me/${id}/read`,
      {},
      { withCredentials: true }
    );
  }

  deleteAllUserNotifications(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/user/me/all`,
      { withCredentials: true }
    );
  }

  deleteUserNotification(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/user/me/${id}`,
      { withCredentials: true }
    );
  }
}