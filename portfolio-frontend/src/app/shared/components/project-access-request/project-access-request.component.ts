import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccessRequestService } from '../../../services/access-request.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Project } from '../../../models/project.model';
import type { AccessRequest } from '../../../models/access-request';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';

@Component({
  selector: 'app-project-access-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-access-request.component.html',
  styleUrls: ['./project-access-request.component.scss']
})
export class ProjectAccessRequestComponent implements OnInit, OnDestroy {
  @Input() project!: Project;
  @Input() showAsButton = false; 
  @Output() accessGranted = new EventEmitter<string>(); 
  @Output() statusChanged = new EventEmitter<string>(); 

  private accessRequestService = inject(AccessRequestService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(NotificationWebSocketService);

  showRequestModal = false;
  requestReason = '';
  submitting = false;
  accessStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
  adminMessage: string | null = null;
  loading = true;
  requestId: string | null = null;

  private wsSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.checkAccessStatus();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      if (event.type === 'ACCESS_APPROVED' ||
        event.type === 'ACCESS_REJECTED' ||
        event.type === 'ACCESS_REQUEST') {
        this.checkAccessStatus();
      }
    });
  }

  checkAccessStatus(): void {
    if (!this.authService.isLoggedIn()) {
      this.loading = false;
      this.accessStatus = 'none';
      return;
    }

    this.loading = true;

    this.accessRequestService.checkProjectAccess(this.project.id!).subscribe({
      next: (res) => {
        if (res.data) {
          this.accessStatus = 'approved';
          this.loading = false;
          this.statusChanged.emit('approved');
        } else {
          this.checkExistingRequest();
        }
      },
      error: () => {
        this.loading = false;
        this.accessStatus = 'none';
        this.statusChanged.emit('none');
      }
    });
  }

  private checkExistingRequest(): void {
    this.accessRequestService.getUserProjectRequest(this.project.id!).subscribe({
      next: (res) => {
        const request = res.data;
        if (request) {
          this.requestId = request.id || null;
          this.accessStatus = request.status.toLowerCase() as 'pending' | 'rejected';
          this.adminMessage = request.adminMessage || null;
          this.statusChanged.emit(this.accessStatus);
        } else {
          this.accessStatus = 'none';
          this.statusChanged.emit('none');
        }
        this.loading = false;
      },
      error: () => {
        this.accessStatus = 'none';
        this.statusChanged.emit('none');
        this.loading = false;
      }
    });
  }

  openRequestModal(): void {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.error('Please login to request access');
      return;
    }
    this.requestReason = '';
    this.showRequestModal = true;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.requestReason = '';
    this.submitting = false;
  }

  submitRequest(): void {
    if (!this.requestReason.trim()) {
      this.notificationService.error('Please provide a reason for requesting access');
      return;
    }

    if (this.requestReason.trim().length < 20) {
      this.notificationService.warning('Please provide a more detailed reason (minimum 20 characters)');
      return;
    }

    this.submitting = true;
    const currentUser = this.authService.getCurrentUser();

    const request: Partial<AccessRequest> = {
      name: currentUser?.email?.split('@')[0] || 'User',
      email: currentUser?.email || '',
      reason: this.requestReason,
      projectId: this.project.id
    };

    this.accessRequestService.createRequest(request).subscribe({
      next: (res) => {
        this.submitting = false;
        this.closeRequestModal();
        this.requestId = res.data?.id || null;
        this.accessStatus = 'pending';
        this.statusChanged.emit('pending');
        this.notificationService.success('Access request submitted! You will be notified when approved.');
      },
      error: (err) => {
        console.error('Failed to submit request:', err);
        this.submitting = false;
        const errorMsg = err.error?.message || 'Failed to submit request. Please try again.';
        this.notificationService.error(errorMsg);

        if (errorMsg.includes('pending') || errorMsg.includes('approved')) {
          this.checkAccessStatus();
        }
      }
    });
  }

  openGithub(): void {
    if (this.accessStatus !== 'approved') {
      this.notificationService.error('You do not have access to this repository');
      return;
    }

    this.accessRequestService.getGithubUrl(this.project.id!).subscribe({
      next: (res) => {
        if (res.data) {
          window.open(res.data, '_blank');
          this.accessGranted.emit(res.data);
        }
      },
      error: (err) => {
        console.error('Failed to get GitHub URL:', err);
        this.notificationService.error('Failed to access repository');
      }
    });
  }

  getStatusText(): string {
    switch (this.accessStatus) {
      case 'approved': return '✅ Access Granted';
      case 'pending': return '⏳ Awaiting Approval';
      case 'rejected': return '❌ Access Denied';
      default: return '🔒 Request Access';
    }
  }

  getStatusClass(): string {
    return this.accessStatus;
  }

  getStatusIcon(): string {
    switch (this.accessStatus) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '🔒';
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  canRequest(): boolean {
    return this.isLoggedIn() && this.accessStatus === 'none';
  }

  isPending(): boolean {
    return this.accessStatus === 'pending';
  }

  isRejected(): boolean {
    return this.accessStatus === 'rejected';
  }

  isApproved(): boolean {
    return this.accessStatus === 'approved';
  }
}