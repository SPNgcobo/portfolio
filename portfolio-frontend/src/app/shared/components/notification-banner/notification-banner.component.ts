import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationDisplayService } from '../../../services/notification-display.service';
import { Notification } from '../../../models/notification.model';
import { Subscription } from 'rxjs';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.scss']
})
export class NotificationBannerComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationDisplayService);
  private webSocketService = inject(NotificationWebSocketService);

  notifications: Notification[] = [];
  loading = true;
  dismissedNotifications: Set<string> = new Set();
  private wsSubscription: Subscription | null = null;
  private readonly STORAGE_KEY = 'dismissed_notifications';

  ngOnInit(): void {
    this.loadDismissedFromStorage();
    this.loadNotifications();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private loadDismissedFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const dismissedArray = JSON.parse(stored);
      this.dismissedNotifications = new Set(dismissedArray);
    }
  }

  private saveDismissedToStorage(): void {
    const dismissedArray = Array.from(this.dismissedNotifications);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dismissedArray));
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe(() => {
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.notificationService.getActiveNotifications().subscribe({
      next: (res) => {
        this.notifications = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
        this.loading = false;
      }
    });
  }

  dismissNotification(id: string): void {
    this.dismissedNotifications.add(id);
    this.saveDismissedToStorage();
  }

  isDismissed(id: string): boolean {
    return this.dismissedNotifications.has(id);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'banner': return '📢';
      case 'alert': return '⚠️';
      case 'update': return '🔄';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '📌';
    }
  }

  getTypeClass(type: string): string {
    return type;
  }
}