import { Component, inject, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationDisplayService } from '../../services/notification-display.service';
import { NotificationWebSocketService } from '../../services/notification-websocket.service';
import { Notification } from '../../models/notification.model';
import { ActivityNotificationService, ActivityEvent } from '../../shared/services/activity-notification.service';
import { NotificationService as ToastService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private router = inject(Router);
  private notificationService = inject(NotificationDisplayService);
  private notificationWebSocket = inject(NotificationWebSocketService);
  private activityNotificationService = inject(ActivityNotificationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  isMenuOpen = false;
  showNotificationPanel = false;
  activeNotifications: Notification[] = [];
  activityEvents: ActivityEvent[] = [];
  userNotifications: any[] = [];
  unreadNotificationsCount = 0;
  readNotifications: Set<string> = new Set();
  loading = false;

  userDisplayName: string = 'User';

  private wsNotificationSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  private refreshInterval: any;
  private readonly STORAGE_KEY = 'read_notifications';

  ngOnInit(): void {
    this.loadReadNotificationsFromStorage();

    this.loadNotifications();
    this.loadActivityEvents();
    this.subscribeToWebSocket();

    this.authSubscription = this.auth.user$.subscribe((user) => {
      this.updateUserDisplayName(user);
      if (user && user.email) {
        this.loadNotifications();
        if (this.auth.isAdmin()) {
          this.loadActivityEvents();
        }
      }
    });

    this.refreshInterval = setInterval(() => {
      if (this.auth.isLoggedIn()) {
        this.updateUnreadCountOnly();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.wsNotificationSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  private updateUserDisplayName(user: any): void {
    if (user) {
      if (user.username) {
        this.userDisplayName = user.username;
      } else if (user.email) {
        this.userDisplayName = user.email.split('@')[0] || 'User';
      } else {
        this.userDisplayName = 'User';
      }
    } else {
      this.userDisplayName = 'User';
    }
    this.cdr.detectChanges();
  }

  private subscribeToWebSocket(): void {
    this.wsNotificationSubscription = this.notificationWebSocket.onNotificationUpdate().subscribe((event) => {
      console.log('📡 Navbar WebSocket event received:', event.type);

      if (this.auth.isLoggedIn()) {
        this.loadNotifications();
        if (this.auth.isAdmin()) {
          this.loadActivityEventsSilently();
        }
        this.updateUnreadCount();
        this.cdr.detectChanges();
      }
    });
  }

  toggleUserDropdown(): void {
    const dropdown = document.querySelector('.dropdown.user-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('open');
    }
  }

  getUserDisplayName(): string {
    if (this.userDisplayName && this.userDisplayName !== 'User') {
      return this.userDisplayName;
    }
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      if (currentUser.username) {
        return currentUser.username;
      }
      if (currentUser.email) {
        return currentUser.email.split('@')[0] || 'User';
      }
    }
    return 'User';
  }

  private updateUnreadCountOnly(): void {
    if (!this.isAdmin()) {
      this.notificationService.getUserUnreadCount().subscribe({
        next: (res) => {
          this.unreadNotificationsCount = res.data || 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to get unread count:', err);
        }
      });
    } else {
      let count = 0;
      if (this.activeNotifications) {
        count += this.activeNotifications.filter(n => n.id && !this.readNotifications.has(n.id)).length;
      }
      if (this.activityEvents) {
        count += this.activityEvents.filter(e => !e.read).length;
      }
      this.unreadNotificationsCount = count;
      this.cdr.detectChanges();
    }
  }

  private loadActivityEventsSilently(): void {
    if (!this.auth.isAdmin()) return;

    this.activityNotificationService.getAdminEvents().subscribe({
      next: (res) => {
        this.activityEvents = res.data || [];
        this.updateUnreadCount();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load activity events silently:', err);
      }
    });
  }

  private loadReadNotificationsFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const readArray = JSON.parse(stored);
        this.readNotifications = new Set(readArray);
      } catch (e) {
        console.error('Failed to parse read notifications:', e);
        this.readNotifications = new Set();
      }
    }
  }

  private saveReadNotificationsToStorage(): void {
    const readArray = Array.from(this.readNotifications);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(readArray));
  }

  loadNotifications(): void {
    if (!this.auth.isLoggedIn()) {
      console.log('⏸️ User not logged in, skipping notification load');
      return;
    }

    if (!this.isAdmin()) {
      this.notificationService.getUserNotifications().subscribe({
        next: (res) => {
          console.log('📬 User notifications loaded:', res.data?.length || 0);
          this.userNotifications = res.data || [];
          this.updateUnreadCount();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load user notifications:', err);
        }
      });
    } else {
      this.fallbackLoadActiveNotifications();
      this.loadActivityEvents();
    }
  }

  private fallbackLoadActiveNotifications(): void {
    this.notificationService.getActiveNotifications().subscribe({
      next: (res) => {
        console.log('📬 Active notifications loaded:', res.data?.length || 0);
        this.activeNotifications = res.data || [];
        this.updateUnreadCount();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications:', err);
      }
    });
  }

  loadActivityEvents(): void {
    if (!this.auth.isAdmin()) return;

    this.activityNotificationService.getAdminEvents().subscribe({
      next: (res) => {
        console.log('📬 Activity events loaded:', res.data?.length || 0);
        this.activityEvents = res.data || [];
        this.updateUnreadCount();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load activity events:', err);
      }
    });
  }

  private updateUnreadCount(): void {
    let count = 0;

    if (!this.isAdmin()) {
      count = this.userNotifications.filter(n => !n.read).length;
    } else {
      const unreadAnnouncements = this.activeNotifications.filter(n => n.id && !this.readNotifications.has(n.id)).length;
      const unreadEvents = this.activityEvents.filter(e => !e.read).length;
      count = unreadAnnouncements + unreadEvents;
    }

    this.unreadNotificationsCount = count;
    this.cdr.detectChanges();
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
    if (this.showNotificationPanel) {
      this.loadNotifications();
      if (this.auth.isAdmin()) {
        this.loadActivityEvents();
      }
    }
    this.cdr.detectChanges();
  }

  markAllAsRead(): void {
    if (!this.isAdmin()) {
      this.notificationService.markUserNotificationsAsRead().subscribe({
        next: () => {
          this.userNotifications.forEach(notification => {
            notification.read = true;
          });
          this.unreadNotificationsCount = 0;
          this.cdr.detectChanges();
          this.toastService.success('All notifications marked as read');
          this.loadNotifications();
        },
        error: (err) => {
          console.error('Failed to mark all as read:', err);
          this.toastService.error('Failed to mark notifications as read');
        }
      });
    } else {
      this.activeNotifications.forEach(notification => {
        if (notification.id) {
          this.readNotifications.add(notification.id);
        }
      });

      this.activityNotificationService.markAllAsRead().subscribe({
        next: () => {
          this.loadActivityEvents();
          this.toastService.success('All notifications marked as read');
        },
        error: (err) => {
          console.error('Failed to mark all as read:', err);
          this.toastService.error('Failed to mark notifications as read');
        }
      });

      this.unreadNotificationsCount = 0;
      this.saveReadNotificationsToStorage();
      this.cdr.detectChanges();
    }
  }

  markActivityAsRead(id: string): void {
    if (!this.isAdmin()) {
      this.notificationService.markUserNotificationAsRead(id).subscribe({
        next: () => {
          const notification = this.userNotifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
            this.updateUnreadCount();
            this.cdr.detectChanges();
          }
          this.toastService.success('Notification marked as read');
        },
        error: (err) => {
          console.error('Failed to mark notification as read:', err);
          this.notificationService.markUserNotificationsAsRead().subscribe({
            next: () => {
              this.userNotifications.forEach(n => n.read = true);
              this.unreadNotificationsCount = 0;
              this.cdr.detectChanges();
              this.toastService.success('All notifications marked as read');
            },
            error: (e) => {
              console.error('Fallback also failed:', e);
              this.toastService.error('Failed to mark notification as read');
            }
          });
        }
      });
    } else {
      this.activityNotificationService.markAsRead(id).subscribe({
        next: () => {
          const event = this.activityEvents.find(e => e.id === id);
          if (event) {
            event.read = true;
            this.updateUnreadCount();
            this.cdr.detectChanges();
          }
          this.toastService.success('Notification marked as read');
        },
        error: (err) => {
          console.error('Failed to mark as read:', err);
          this.toastService.error('Failed to mark notification as read');
        }
      });
    }
  }

  deleteActivityEvent(id: string, event: Event): void {
    event.stopPropagation();

    if (!this.isAdmin()) {
      this.notificationService.deleteUserNotification(id).subscribe({
        next: () => {
          this.userNotifications = this.userNotifications.filter(n => n.id !== id);
          this.updateUnreadCount();
          this.cdr.detectChanges();
          this.toastService.success('Notification deleted');
        },
        error: (err) => {
          console.error('Failed to delete notification:', err);
          this.toastService.error('Failed to delete notification');
        }
      });
    } else {
      this.activityNotificationService.deleteEvent(id).subscribe({
        next: () => {
          this.activityEvents = this.activityEvents.filter(e => e.id !== id);
          this.updateUnreadCount();
          this.cdr.detectChanges();
          this.toastService.success('Notification deleted');
        },
        error: (err) => {
          console.error('Failed to delete event:', err);
          this.toastService.error('Failed to delete notification');
        }
      });
    }
  }

  deleteAllRead(): void {
    if (this.isAdmin()) {
      this.activityNotificationService.deleteAllRead().subscribe({
        next: () => {
          this.activityEvents = this.activityEvents.filter(e => !e.read);
          this.updateUnreadCount();
          this.cdr.detectChanges();
          this.toastService.success('All read notifications cleared');
        },
        error: (err) => {
          console.error('Failed to delete all read:', err);
          this.toastService.error('Failed to clear notifications');
        }
      });
    }
  }

  deleteAllUserNotifications(): void {
    if (!this.isAdmin()) {
      this.notificationService.deleteAllUserNotifications().subscribe({
        next: () => {
          this.userNotifications = [];
          this.unreadNotificationsCount = 0;
          this.cdr.detectChanges();
          if (this.userNotifications.length === 0 && this.activeNotifications.length === 0) {
            this.showNotificationPanel = false;
          }
          this.toastService.success('All notifications deleted');
        },
        error: (err) => {
          console.error('Failed to delete all notifications:', err);
          this.toastService.error('Failed to delete notifications');
        }
      });
    }
  }

  navigateToComment(event: any): void {
    if (event.targetUrl) {
      this.router.navigate([event.targetUrl]);
      if (event.targetId) {
        setTimeout(() => {
          const element = document.getElementById('comment-' + event.targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-comment');
            setTimeout(() => {
              element.classList.remove('highlight-comment');
            }, 3000);
          }
        }, 500);
      }
      return;
    }

    if (event.type === 'NEW_COMMENT' || event.type === 'COMMENT_APPROVED' || event.type === 'ADMIN_REPLY') {
      this.router.navigate(['/admin/comments']);
    } else if (event.type === 'ACCESS_REQUEST' || event.type === 'ACCESS_APPROVED' || event.type === 'ACCESS_REJECTED') {
      this.router.navigate(['/admin/access-requests']);
    }
  }

  navigateToNotification(notification: any): void {
    if (notification.targetUrl) {
      this.router.navigate([notification.targetUrl]);
      if (notification.targetId) {
        setTimeout(() => {
          const element = document.getElementById('comment-' + notification.targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-comment');
            setTimeout(() => {
              element.classList.remove('highlight-comment');
            }, 3000);
          }
        }, 500);
      }
      return;
    }

    if (notification.type === 'NEW_COMMENT' || notification.type === 'COMMENT_APPROVED' || notification.type === 'ADMIN_REPLY') {
      this.router.navigate(['/admin/comments']);
    } else if (notification.type === 'ACCESS_REQUEST' || notification.type === 'ACCESS_APPROVED' || notification.type === 'ACCESS_REJECTED') {
      this.router.navigate(['/admin/access-requests']);
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'NEW_COMMENT': '💬',
      'COMMENT_APPROVED': '✅',
      'ADMIN_REPLY': '👨‍💼',
      'ACCESS_REQUEST': '🔐',
      'ACCESS_APPROVED': '🔓',
      'ACCESS_REJECTED': '🚫',
      'CONTACT_MESSAGE': '📧',
      'NEW_USER': '👤',
      'PROJECT_LIKE': '❤️',
      'GITHUB_CLICK': '🐙',
      'DEMO_CLICK': '🚀',
      'DETAIL_CLICK': '📄',
      'PROJECT_PUBLISHED': '📢',
      'PROJECT_UNPUBLISHED': '🔇',
      'BLOG_CREATED': '📝',
      'BLOG_PUBLISHED': '📰',
      'MEDIA_UPLOADED': '🖼️'
    };
    return icons[type] || '📌';
  }

  getActivityTypeClass(type: string): string {
    if (type.includes('COMMENT')) return 'comment';
    if (type.includes('ACCESS')) return 'access';
    if (type === 'CONTACT_MESSAGE') return 'contact';
    if (type === 'NEW_USER') return 'user';
    if (type.includes('CLICK') || type === 'PROJECT_LIKE') return 'engagement';
    return 'default';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearUser();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout error:', err);
      }
    });
  }

  get isLightMode(): boolean {
    return this.theme.isLight();
  }

  get currentUser() {
    return this.auth.getCurrentUser();
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  hasReadEvents(): boolean {
    return this.activityEvents.some(e => e.read);
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: Event): void {
    const clickedInside = (event.target as HTMLElement).closest('.navbar');
    const clickedNotificationPanel = (event.target as HTMLElement).closest('.notification-panel');
    const clickedUserDropdown = (event.target as HTMLElement).closest('.user-dropdown');

    if (!clickedInside && !clickedNotificationPanel) {
      this.isMenuOpen = false;
      this.showNotificationPanel = false;
    }

    if (!clickedUserDropdown) {
      const dropdown = document.querySelector('.dropdown.user-dropdown');
      if (dropdown) {
        dropdown.classList.remove('open');
      }
    }
  }
}