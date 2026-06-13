import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Toast } from '../../services/notification.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);

  toast: Toast | null = null;
  visible = false;
  private subscription: Subscription | null = null;
  private timeout: any = null;

  ngOnInit(): void {
    this.subscription = this.notificationService.toastState$.subscribe((toast) => {
      this.toast = toast;
      this.visible = true;

      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.timeout = setTimeout(() => {
        this.visible = false;
      }, toast.duration || 3000);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  getToastClass(): string {
    if (!this.toast) return '';
    switch (this.toast.type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      default: return 'toast-info';
    }
  }
}