import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardSocketService {

  private client!: Client;

  connect(): void {

    this.client = new Client({

      brokerURL:
      `${environment.socketUrl}/websocket`,

      reconnectDelay: 5000,

      onConnect: () => {

        console.log('✅ Connected to dashboard websocket');

        this.client.subscribe('/topic/dashboard', (message: IMessage) => {
          console.log('📡 Dashboard Event:', JSON.parse(message.body));
        });

        this.client.subscribe('/topic/dashboard-stats', (message: IMessage) => {
          console.log('📊 Live Dashboard Stats:', JSON.parse(message.body));
        });
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        console.error(frame.body);
      },

      onWebSocketError: (event) => {
        console.error('❌ WebSocket Error:', event);
      }
    });

    this.client.activate();
  }
}