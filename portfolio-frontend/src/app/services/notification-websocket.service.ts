import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage, IFrame } from '@stomp/stompjs';
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
  private isConnected = false;

  constructor() {
    this.authService.user$.subscribe((user) => {
      if (user && user.email) {
        if (!this.isConnected) {
          this.connect();
        }
      } else {
        this.disconnect();
      }
    });
  }

  private connect(): void {
    if (this.client && this.isConnected) {
      console.log('⏭️ WebSocket already connected');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.email) {
      console.log('⏸️ No user logged in, skipping WebSocket connection');
      return;
    }

    console.log('🔐 Connecting WebSocket for user:', currentUser.email);

    this.client = new Client({
      brokerURL: `${environment.socketUrl}/websocket`,
      reconnectDelay: 5000,
      debug: (str: string) => {

      },
      onConnect: () => {
        console.log('✅ Connected to notification WebSocket');
        this.isConnected = true;

        this.client?.subscribe('/topic/admin-events', (message: IMessage) => {
          console.log('📡 Admin event received:', message.body);
          try {
            const data = JSON.parse(message.body);
            this.notificationSubject.next({
              type: data.type,
              payload: data.payload || data.message
            });
          } catch (e) {
            console.error('Failed to parse admin event:', e);
          }
        });

        this.client?.subscribe('/topic/activity', (message: IMessage) => {
          console.log('📡 Activity event received:', message.body);
          try {
            const data = JSON.parse(message.body);
            this.activitySubject.next({
              type: data.type,
              payload: data.payload || data.message
            });
            this.notificationSubject.next({
              type: data.type,
              payload: data.payload || data.message
            });
          } catch (e) {
            console.error('Failed to parse activity event:', e);
          }
        });

        this.client?.subscribe('/user/queue/notifications', (message: IMessage) => {
          console.log('🔔 User-specific notification received:', message.body);
          try {
            const data = JSON.parse(message.body);
            this.notificationSubject.next({
              type: data.type,
              payload: data.payload
            });
          } catch (e) {
            console.error('Failed to parse user notification:', e);
          }
        });

        this.client?.subscribe('/topic/notifications', (message: IMessage) => {
          console.log('🔔 Public notification received:', message.body);
          try {
            const data = JSON.parse(message.body);
            this.notificationSubject.next({
              type: data.type,
              payload: data.payload
            });
          } catch (e) {
            console.error('Failed to parse public notification:', e);
          }
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        this.isConnected = false;
      },
      onWebSocketError: (event: Event) => {
        console.error('❌ WebSocket Error:', event);
        this.isConnected = false;
      },
      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
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
      try {
        this.client.deactivate();
        this.client = null;
        this.isConnected = false;
        console.log('🔌 WebSocket disconnected manually');
      } catch (e) {
        console.error('Error disconnecting WebSocket:', e);
      }
    }
  }

  reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 1000);
  }
}