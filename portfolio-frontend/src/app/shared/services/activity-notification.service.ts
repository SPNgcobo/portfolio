import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface ActivityEvent {
  id?: string;
  type: string;
  message: string;
  userId?: string;
  userName?: string;
  targetUrl?: string;
  targetId?: string;
  createdAt?: Date;
  read: boolean;
  userNotification?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityNotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activity-events`;

  getAllEvents(): Observable<ApiResponse<ActivityEvent[]>> {
    return this.http.get<ApiResponse<ActivityEvent[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  getAdminEvents(): Observable<ApiResponse<ActivityEvent[]>> {
    return this.http.get<ApiResponse<ActivityEvent[]>>(
      `${this.apiUrl}/admin`,
      { withCredentials: true }
    );
  }

  getUnreadCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/unread/count`,
      { withCredentials: true }
    );
  }

  markAsRead(id: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/${id}/read`,
      {},
      { withCredentials: true }
    );
  }

  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/read/all`,
      {},
      { withCredentials: true }
    );
  }

  deleteEvent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  deleteAllRead(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/read/all`,
      { withCredentials: true }
    );
  }

  markUserAsRead(id: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/user/${id}/read`,
      {},
      { withCredentials: true }
    );
  }

  deleteUserEvent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/user/${id}`,
      { withCredentials: true }
    );
  }

  deleteAllUserEvents(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/user/all`,
      { withCredentials: true }
    );
  }
}