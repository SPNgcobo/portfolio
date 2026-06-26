import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNotificationService } from '../../services/admin-notification.service';
import { Notification, NotificationType } from '../../../models/notification.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-notifications.component.html',
  styleUrls: ['./admin-notifications.component.scss']
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(AdminNotificationService);
  private webSocketService = inject(NotificationWebSocketService);

  notifications: Notification[] = [];
  loading = true;
  private wsSubscription: Subscription | null = null;

  showModal = false;
  isEditing = false;
  selectedNotificationId: string | null = null;

  formData: Notification = {
    title: '',
    message: '',
    type: 'info',
    active: true
  };

  submitting = false;

  showDeleteDialog = false;
  deleteNotificationId = '';
  deleteNotificationTitle = '';

  notificationTypes: NotificationType[] = ['banner', 'alert', 'update', 'info', 'warning', 'success'];

  ngOnInit(): void {
    this.loadNotifications();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      console.log('WebSocket event received:', event);
      this.loadNotifications();
    });
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getAllNotifications().subscribe({
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

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedNotificationId = null;
    this.formData = {
      title: '',
      message: '',
      type: 'info',
      active: true
    };
    this.showModal = true;
  }

  openEditModal(notification: Notification): void {
    this.isEditing = true;
    this.selectedNotificationId = notification.id!;
    this.formData = { ...notification };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.submitting = false;
  }

  submitForm(): void {
    if (!this.formData.title.trim() || !this.formData.message.trim()) {
      return;
    }

    this.submitting = true;

    if (this.isEditing && this.selectedNotificationId) {
      this.notificationService.updateNotification(this.selectedNotificationId, this.formData).subscribe({
        next: () => {
          this.loadNotifications();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to update notification:', err);
          this.submitting = false;
        }
      });
    } else {
      this.notificationService.createNotification(this.formData).subscribe({
        next: () => {
          this.loadNotifications();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to create notification:', err);
          this.submitting = false;
        }
      });
    }
  }

  toggleActive(notification: Notification): void {
    this.notificationService.toggleActive(notification.id!).subscribe({
      next: () => {
      },
      error: (err) => console.error('Failed to toggle notification:', err)
    });
  }

  openDeleteDialog(id: string, title: string): void {
    this.deleteNotificationId = id;
    this.deleteNotificationTitle = title;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.notificationService.deleteNotification(this.deleteNotificationId).subscribe({
      next: () => {
        this.showDeleteDialog = false;
      },
      error: (err) => {
        console.error('Failed to delete notification:', err);
        this.showDeleteDialog = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
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