import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Notification } from '../../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  getAllNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  getActiveNotifications(): Observable<ApiResponse<Notification[]>> {
    return this.http.get<ApiResponse<Notification[]>>(
      `${this.apiUrl}/active`,
      { withCredentials: true }
    );
  }

  createNotification(notification: Partial<Notification>): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(
      `${this.apiUrl}`,
      notification,
      { withCredentials: true }
    );
  }

  updateNotification(id: string, notification: Partial<Notification>): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(
      `${this.apiUrl}/${id}`,
      notification,
      { withCredentials: true }
    );
  }

  deleteNotification(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  toggleActive(id: string): Observable<ApiResponse<Notification>> {
    return this.http.put<ApiResponse<Notification>>(
      `${this.apiUrl}/${id}/toggle`,
      {},
      { withCredentials: true }
    );
  }
}