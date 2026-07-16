import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessRequestService } from '../../../services/access-request.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';
import type { AccessRequest } from '../../../models/access-request';

@Component({
  selector: 'app-admin-access-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-access-requests.component.html',
  styleUrls: ['./admin-access-requests.component.scss']
})
export class AdminAccessRequestsComponent implements OnInit, OnDestroy {
  private accessRequestService = inject(AccessRequestService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(NotificationWebSocketService);

  requests: AccessRequest[] = [];
  loading = true;
  activeTab: 'pending' | 'all' = 'pending';

  showDecisionModal = false;
  selectedRequest: AccessRequest | null = null;
  adminMessage = '';
  decisionType: 'approve' | 'reject' = 'approve';
  processing = false;

  private wsSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadRequests();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      if (event.type === 'ACCESS_REQUEST' ||
        event.type === 'ACCESS_APPROVED' ||
        event.type === 'ACCESS_REJECTED') {
        this.loadRequests();
      }
    });
  }

  loadRequests(): void {
    this.loading = true;
    this.accessRequestService.getAllRequests().subscribe({
      next: (res) => {
        this.requests = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load access requests:', err);
        this.loading = false;
      }
    });
  }

  getPendingRequests(): AccessRequest[] {
    return this.requests.filter(r => r.status === 'PENDING');
  }

  getFilteredRequests(): AccessRequest[] {
    if (this.activeTab === 'pending') {
      return this.getPendingRequests();
    }
    return this.requests;
  }

  openDecisionModal(request: AccessRequest, decision: 'approve' | 'reject'): void {
    this.selectedRequest = request;
    this.decisionType = decision;
    this.adminMessage = '';
    this.showDecisionModal = true;
  }

  closeDecisionModal(): void {
    this.showDecisionModal = false;
    this.selectedRequest = null;
    this.adminMessage = '';
    this.processing = false;
  }

  submitDecision(): void {
    if (!this.selectedRequest) return;

    this.processing = true;

    const action = this.decisionType === 'approve'
      ? this.accessRequestService.approveRequest(this.selectedRequest.id!, this.adminMessage)
      : this.accessRequestService.rejectRequest(this.selectedRequest.id!, this.adminMessage);

    action.subscribe({
      next: () => {
        this.processing = false;
        this.closeDecisionModal();
        this.notificationService.success(
          `Request ${this.decisionType === 'approve' ? 'approved' : 'rejected'} successfully`
        );
        this.loadRequests();
      },
      error: (err) => {
        console.error('Failed to process request:', err);
        this.processing = false;
        this.notificationService.error('Failed to process request');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      default: return 'pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED': return '✅ Approved';
      case 'REJECTED': return '❌ Rejected';
      default: return '⏳ Pending';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown date';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}