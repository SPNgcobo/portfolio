import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';

export interface NotificationEvent {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationWebSocketService {
  private client: Client | null = null;
  private notificationSubject = new Subject<NotificationEvent>();
  private activitySubject = new Subject<NotificationEvent>();
  private authService = inject(AuthService);

  constructor() {
    this.connect();
  }

  private connect(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('🔐 Current user for WebSocket:', currentUser?.email);

    this.client = new Client({
      brokerURL: `${environment.socketUrl}/websocket`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ Connected to notification WebSocket');

        this.client?.subscribe('/topic/admin-events', (message: IMessage) => {
          console.log('📡 Admin event received:', message.body);
          const data = JSON.parse(message.body);
          this.notificationSubject.next({
            type: data.type,
            payload: data.payload || data.message
          });
        });

        this.client?.subscribe('/topic/activity', (message: IMessage) => {
          console.log('📡 Activity event received:', message.body);
          const data = JSON.parse(message.body);
          this.activitySubject.next({
            type: data.type,
            payload: data.payload || data.message
          });
          this.notificationSubject.next({
            type: data.type,
            payload: data.payload || data.message
          });
        });

        this.client?.subscribe('/user/queue/notifications', (message: IMessage) => {
          console.log('🔔 User-specific notification received:', message.body);
          const data = JSON.parse(message.body);
          this.notificationSubject.next({
            type: data.type,
            payload: data.payload
          });
        });

        this.client?.subscribe('/topic/notifications', (message: IMessage) => {
          console.log('🔔 Public notification received:', message.body);
          const data = JSON.parse(message.body);
          this.notificationSubject.next({
            type: data.type,
            payload: data.payload
          });
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.error('❌ WebSocket Error:', event);
      }
    });

    this.client.activate();
  }

  onNotificationUpdate(): Observable<NotificationEvent> {
    return this.notificationSubject.asObservable();
  }

  onActivityUpdate(): Observable<NotificationEvent> {
    return this.activitySubject.asObservable();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }
}