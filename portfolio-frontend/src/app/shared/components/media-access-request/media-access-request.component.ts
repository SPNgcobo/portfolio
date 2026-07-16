import { Component, Input, OnInit, inject, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccessRequestService } from '../../../services/access-request.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Media } from '../../../models/media.model';
import { NotificationWebSocketService } from '../../../services/notification-websocket.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-media-access-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './media-access-request.component.html',
  styleUrls: ['./media-access-request.component.scss']
})
export class MediaAccessRequestComponent implements OnInit, OnDestroy {
  @Input() media!: Media;
  @Output() modalStateChange = new EventEmitter<boolean>();

  private accessRequestService = inject(AccessRequestService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(NotificationWebSocketService);
  private sanitizer = inject(DomSanitizer);

  showRequestModal = false;
  requestReason = '';
  submitting = false;
  accessStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';
  adminMessage: string | null = null;
  loading = true;
  showPdfViewer = false;
  pdfViewerUrl: SafeResourceUrl | null = null;

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
        if (event.payload && event.payload.includes(this.media.id)) {
          this.checkAccessStatus();
        }
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
    this.accessRequestService.checkMediaAccess(this.media.id!).subscribe({
      next: (res) => {
        if (res.data) {
          this.accessStatus = 'approved';
          this.loading = false;
        } else {
          this.checkExistingRequest();
        }
      },
      error: (err) => {
        console.error('Failed to check media access:', err);
        this.loading = false;
        this.accessStatus = 'none';
      }
    });
  }

  private checkExistingRequest(): void {
    this.accessRequestService.getUserMediaRequest(this.media.id!).subscribe({
      next: (res) => {
        const request = res.data;
        if (request) {
          this.accessStatus = request.status.toLowerCase() as 'pending' | 'rejected';
          this.adminMessage = request.adminMessage || null;
        } else {
          this.accessStatus = 'none';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to get user media request:', err);
        this.accessStatus = 'none';
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
    this.modalStateChange.emit(true);
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.requestReason = '';
    this.submitting = false;
    this.modalStateChange.emit(false);
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
    this.accessRequestService.createMediaRequest(this.media.id!, this.requestReason).subscribe({
      next: () => {
        this.submitting = false;
        this.closeRequestModal();
        this.accessStatus = 'pending';
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

  getFileName(): string {
    if (!this.media.url) return this.media.title || 'file';

    let url = this.media.url;
    if (url.includes('?')) {
      url = url.split('?')[0];
    }

    const parts = url.split('/');
    let filename = parts[parts.length - 1] || this.media.title || 'file';

    if (!filename.includes('.') && this.media.title) {
      if (this.media.format) {
        return `${this.media.title}.${this.media.format}`;
      }
      return this.media.title;
    }

    return filename;
  }

  getFileExtension(): string {
    if (this.media.format) {
      return this.media.format.toLowerCase();
    }

    const filename = this.getFileName();
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }

    if (this.media.url) {
      const urlParts = this.media.url.split('.');
      if (urlParts.length > 1) {
        const ext = urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
        if (ext && ext.length < 6) {
          return ext;
        }
      }
    }

    return '';
  }

  isViewableInBrowser(): boolean {
    const ext = this.getFileExtension();
    if (!ext) return false;
    const viewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'txt', 'csv', 'xml', 'json'];
    return viewableTypes.includes(ext);
  }

  viewFile(): void {
    if (this.accessStatus !== 'approved') {
      this.notificationService.error('You do not have access to this file');
      return;
    }

    const ext = this.getFileExtension();

    if (ext === 'pdf') {
      let url = this.media.url;

      if (url.includes('/raw/upload/')) {
        const viewUrl = url.replace('/raw/upload/', '/image/upload/');
        const newWindow = window.open(viewUrl, '_blank');

        setTimeout(() => {
          try {
            if (newWindow && newWindow.document) {
              const googleViewerUrl = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(viewUrl)}`;
              if (newWindow) {
                newWindow.close();
              }
              window.open(googleViewerUrl, '_blank');
            }
          } catch (e) {
          }
        }, 3000);
      } else {
        window.open(url, '_blank');
      }
    } else if (this.isViewableInBrowser()) {
      window.open(this.media.url, '_blank');
    } else {
      this.downloadFile();
    }
  }

  downloadFile(): void {
    if (this.accessStatus !== 'approved') {
      this.notificationService.error('You do not have access to this file');
      return;
    }

    const filename = this.media.title || 'file';
    const ext = this.getFileExtension();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9\-_\s]/g, '');
    const fullFilename = ext ? `${cleanFilename}.${ext}` : cleanFilename;

    let urlToFetch = this.media.url;
    if (urlToFetch.endsWith('.pdf')) {
      urlToFetch = urlToFetch.replace(/\.pdf$/, '');
    }

    fetch(urlToFetch, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/pdf,application/octet-stream,*/*'
      }
    })
      .then(response => {
        if (!response.ok) {
          if (urlToFetch !== this.media.url) {
            return fetch(this.media.url, {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': 'application/pdf,application/octet-stream,*/*'
              }
            });
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fullFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
        this.notificationService.success(`Downloading: ${fullFilename}`);
      })
      .catch(error => {
        console.error('Download failed:', error);
        this.notificationService.warning('Download failed. Opening in new tab...');
        window.open(this.media.url, '_blank');
      });
  }

  getStatusText(): string {
    switch (this.accessStatus) {
      case 'approved': return 'Access Granted';
      case 'pending': return 'Awaiting Approval';
      case 'rejected': return 'Access Denied';
      default: return 'Request Access';
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

  isApproved(): boolean {
    return this.accessStatus === 'approved';
  }

  isPending(): boolean {
    return this.accessStatus === 'pending';
  }

  isRejected(): boolean {
    return this.accessStatus === 'rejected';
  }
}