import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminAuditLogService } from '../../services/admin-audit-log.service';
import { AuditLog } from '../../models/audit-log.model';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';
import { NotificationService as ToastService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-audit-logs.component.html',
  styleUrls: ['./admin-audit-logs.component.scss']
})
export class AdminAuditLogsComponent implements OnInit, OnDestroy {
  private auditLogService = inject(AdminAuditLogService);
  private webSocketService = inject(NotificationWebSocketService);
  private toastService = inject(ToastService); 

  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  loading = true;
  autoRefresh = true;

  searchTerm: string = '';
  selectedAction: string = '';
  selectedActor: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  currentPage = 0;
  pageSize = 20;
  totalItems = 0;

  uniqueActions: string[] = [];
  uniqueActors: string[] = [];

  private wsSubscription: Subscription | null = null;
  private refreshInterval: any;

  ngOnInit(): void {
    this.loadLogs();
    this.subscribeToWebSocket();

    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh) {
        this.loadLogsSilently();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      const refreshEvents = [
        'COMMENT_APPROVED', 'COMMENT_DELETED', 'COMMENT_EDITED',
        'ACCESS_REQUEST', 'ACCESS_APPROVED', 'ACCESS_REJECTED',
        'PROJECT_PUBLISHED', 'PROJECT_UNPUBLISHED',
        'BLOG_PUBLISHED', 'BLOG_UNPUBLISHED',
        'MEDIA_UPLOADED', 'MEDIA_DELETED',
        'NEW_USER', 'CONTACT_MESSAGE'
      ];

      if (refreshEvents.includes(event.type)) {
        console.log('🔄 Refreshing audit logs due to:', event.type);
        this.loadLogsSilently();
      }
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.auditLogService.getRecentLogs().subscribe({
      next: (res) => {
        this.logs = res.data || [];
        this.totalItems = this.logs.length;
        this.extractFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load audit logs:', err);
        this.loading = false;
        this.toastService.error('Failed to load audit logs');
      }
    });
  }

  private loadLogsSilently(): void {
    this.auditLogService.getRecentLogs().subscribe({
      next: (res) => {
        this.logs = res.data || [];
        this.totalItems = this.logs.length;
        this.extractFilterOptions();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to load audit logs silently:', err);
      }
    });
  }

  private extractFilterOptions(): void {
    const actions = new Set<string>();
    const actors = new Set<string>();

    this.logs.forEach(log => {
      if (log.action) actions.add(log.action);
      if (log.actor) actors.add(log.actor);
    });

    this.uniqueActions = Array.from(actions).sort();
    this.uniqueActors = Array.from(actors).sort();
  }

  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      const searchMatch = !this.searchTerm ||
        log.action?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.actor?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        log.targetId?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const actionMatch = !this.selectedAction || log.action === this.selectedAction;

      const actorMatch = !this.selectedActor || log.actor === this.selectedActor;

      let dateMatch = true;
      if (this.dateFrom) {
        const fromDate = new Date(this.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        const logDate = new Date(log.createdAt);
        dateMatch = dateMatch && logDate >= fromDate;
      }
      if (this.dateTo) {
        const toDate = new Date(this.dateTo);
        toDate.setHours(23, 59, 59, 999);
        const logDate = new Date(log.createdAt);
        dateMatch = dateMatch && logDate <= toDate;
      }

      return searchMatch && actionMatch && actorMatch && dateMatch;
    });

    this.currentPage = 0;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedAction = '';
    this.selectedActor = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }


  getPaginatedLogs(): AuditLog[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredLogs.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }


  getActionIcon(action: string): string {
    const icons: { [key: string]: string } = {
      'COMMENT_APPROVED': '✅',
      'COMMENT_DELETED': '🗑️',
      'COMMENT_EDITED': '✏️',
      'ADMIN_REPLY': '💬',
      'PROJECT_CREATED': '📁',
      'PROJECT_UPDATED': '📝',
      'PROJECT_DELETED': '🗑️',
      'PROJECT_PUBLISHED': '📢',
      'PROJECT_UNPUBLISHED': '🔇',
      'BLOG_CREATED': '📝',
      'BLOG_UPDATED': '✏️',
      'BLOG_DELETED': '🗑️',
      'BLOG_PUBLISHED': '📰',
      'BLOG_UNPUBLISHED': '🔇',
      'MEDIA_UPLOADED': '📤',
      'MEDIA_DELETED': '🗑️',
      'MEDIA_UPDATED': '✏️',
      'NOTIFICATION_CREATED': '🔔',
      'NOTIFICATION_UPDATED': '✏️',
      'NOTIFICATION_DELETED': '🗑️',
      'SKILL_CREATED': '🛠️',
      'SKILL_UPDATED': '✏️',
      'SKILL_DELETED': '🗑️',
      'TOOL_CREATED': '🔧',
      'TOOL_UPDATED': '✏️',
      'TOOL_DELETED': '🗑️',
      'ACCESS_REQUEST_CREATED': '🔐',
      'ACCESS_REQUEST_APPROVED': '🔓',
      'ACCESS_REQUEST_REJECTED': '🚫',
      'CONTACT_MESSAGE': '📧',
      'ACCOUNT_DELETED': '👤',
      'NEW_USER': '👤'
    };
    return icons[action] || '📌';
  }

  getActionColor(action: string): string {
    if (action.includes('APPROVED') || action.includes('PUBLISHED') || action.includes('CREATED')) {
      return 'success';
    }
    if (action.includes('DELETED') || action.includes('REJECTED') || action.includes('UNPUBLISHED')) {
      return 'danger';
    }
    if (action.includes('UPDATED') || action.includes('EDITED')) {
      return 'warning';
    }
    if (action.includes('REQUEST')) {
      return 'info';
    }
    return 'default';
  }

  getActionLabel(action: string): string {
    return action
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown date';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getRelativeTime(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return this.formatDate(date);
  }

  getActorDisplay(actor: string): string {
    if (!actor) return 'Unknown';
    if (actor === 'ADMIN' || actor === 'Admin') return '👨‍💼 Admin';
    return `👤 ${actor}`;
  }

  getActorType(actor: string): string {
    if (!actor) return 'unknown';
    if (actor === 'ADMIN' || actor === 'Admin') return 'admin';
    if (actor.includes('@') || actor.includes('.')) return 'user';
    return 'system';
  }

  trackByFn(index: number, item: AuditLog): string {
    return item.id || index.toString();
  }

  refreshLogs(): void {
    this.loadLogs();
  }

  exportLogs(): void {
    if (this.filteredLogs.length === 0) {
      this.toastService.warning('No logs to export');
      return;
    }

    const headers = ['Action', 'Actor', 'Details', 'Target ID', 'Date'];
    const rows = this.filteredLogs.map(log => [
      this.getActionLabel(log.action),
      log.actor || 'Unknown',
      log.details || '',
      log.targetId || '',
      this.formatDate(log.createdAt)
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      const escapedRow = row.map(cell =>
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      );
      csvContent += escapedRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.toastService.success(`Exported ${this.filteredLogs.length} logs`);
  }
}