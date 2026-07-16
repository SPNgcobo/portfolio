import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaService } from '../../services/media.service';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Media } from '../../models/media.model';
import { MediaAccessRequestComponent } from '../../shared/components/media-access-request/media-access-request.component';
import { NotificationWebSocketService } from '../../services/notification-websocket.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AccessRequestService } from '../../services/access-request.service';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaAccessRequestComponent],
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss']
})
export class VaultComponent implements OnInit, OnDestroy {
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(NotificationWebSocketService);
  private sanitizer = inject(DomSanitizer);
  private accessRequestService = inject(AccessRequestService);

  vaultMedia: Media[] = [];
  loading = true;
  private wsSubscription: Subscription | null = null;
  private isModalOpen = false;
  private refreshTimeout: any = null;
  private lastRefreshTime = 0;
  private pendingRefresh = false;

  private accessStatusMap: Map<string, string> = new Map();

  ngOnInit(): void {
    this.loadVaultMedia();
    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }

  isMediaAccessApproved(media: Media): boolean {
    if (media.visibility !== 'VAULT') {
      return true;
    }
    if (!this.authService.isLoggedIn()) {
      return false;
    }
    const status = this.accessStatusMap.get(media.id!);
    return status === 'approved';
  }

  onModalStateChange(isOpen: boolean): void {
    this.isModalOpen = isOpen;
    const vaultPage = document.querySelector('.vault-page');
    if (vaultPage) {
      if (isOpen) {
        vaultPage.classList.add('modal-open');
      } else {
        vaultPage.classList.remove('modal-open');
        this.handlePendingRefresh();
      }
    }
  }

  private handlePendingRefresh(): void {
    if (this.pendingRefresh) {
      this.pendingRefresh = false;
      console.log('🔄 Performing pending refresh after modal close');
      this.loadVaultMediaSilently();
    }
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      if (this.isModalOpen) {
        console.log('⏸️ Skipping refresh - modal is open');
        if (event.type === 'ACCESS_APPROVED' ||
          event.type === 'ACCESS_REJECTED' ||
          event.type === 'ACCESS_REQUEST') {
          this.pendingRefresh = true;
        }
        return;
      }

      if (event.type === 'MEDIA_UPLOADED' || event.type === 'VAULT_MEDIA_CREATED') {
        console.log('🔄 Refreshing vault due to new media:', event.type);
        this.loadVaultMedia();
        return;
      }

      if (event.type === 'ACCESS_APPROVED' ||
        event.type === 'ACCESS_REJECTED' ||
        event.type === 'ACCESS_REQUEST') {
        console.log('🔄 Debouncing access status update for:', event.type);
        this.debouncedRefresh();
      }
    });
  }

  private debouncedRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = setTimeout(() => {
      this.loadVaultMediaSilently();
      this.refreshTimeout = null;
    }, 500);
  }

  private loadVaultMediaSilently(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || this.isModalOpen) {
      return;
    }

    const now = Date.now();
    if (now - this.lastRefreshTime < 1000) {
      console.log('⏸️ Skipping refresh - too soon (within 1 second)');
      return;
    }
    this.lastRefreshTime = now;

    console.log('🔄 Loading vault media silently');
    this.mediaService.getVaultMedia(currentUser.email).subscribe({
      next: (res) => {
        this.vaultMedia = res.data || [];
        this.updateAccessStatusMap();
        console.log('✅ Vault media updated silently, count:', this.vaultMedia.length);
      },
      error: (err) => {
        console.error('Failed to load vault media silently:', err);
      }
    });
  }

  loadVaultMedia(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || this.isModalOpen) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.mediaService.getVaultMedia(currentUser.email).subscribe({
      next: (res) => {
        this.vaultMedia = res.data || [];
        this.updateAccessStatusMap();
        this.loading = false;
        this.lastRefreshTime = Date.now();
      },
      error: (err) => {
        console.error('Failed to load vault media:', err);
        this.loading = false;
      }
    });
  }

  private updateAccessStatusMap(): void {
    this.vaultMedia.forEach(media => {
      if (media.visibility !== 'VAULT') {
        this.accessStatusMap.set(media.id!, 'approved');
        return;
      }
      this.accessRequestService.checkMediaAccess(media.id!).subscribe({
        next: (res) => {
          this.accessStatusMap.set(media.id!, res.data ? 'approved' : 'none');
        },
        error: () => {
          this.accessStatusMap.set(media.id!, 'none');
        }
      });
    });
  }


  getImages(): Media[] {
    return this.vaultMedia.filter(media => media.type === 'IMAGE');
  }

  getVideos(): Media[] {
    return this.vaultMedia.filter(media => media.type === 'VIDEO');
  }

  getAudio(): Media[] {
    return this.vaultMedia.filter(media => media.type === 'AUDIO');
  }

  getPDFs(): Media[] {
    return this.vaultMedia.filter(media => media.type === 'PDF');
  }

  getCertificates(): Media[] {
    return this.vaultMedia.filter(media => media.type === 'CERTIFICATE');
  }

  getCVs(): Media[] {
    return this.vaultMedia.filter(media => media.type === 'CV');
  }

  hasAnyMedia(): boolean {
    return this.vaultMedia.length > 0;
  }

  hasCategory(category: string): boolean {
    switch (category) {
      case 'images': return this.getImages().length > 0;
      case 'videos': return this.getVideos().length > 0;
      case 'audio': return this.getAudio().length > 0;
      case 'pdfs': return this.getPDFs().length > 0;
      case 'certificates': return this.getCertificates().length > 0;
      case 'cvs': return this.getCVs().length > 0;
      default: return false;
    }
  }


  getFileIcon(type: string): string {
    switch (type) {
      case 'IMAGE': return '🖼️';
      case 'VIDEO': return '🎥';
      case 'AUDIO': return '🎵';
      case 'PDF': return '📄';
      case 'CERTIFICATE': return '🏆';
      case 'CV': return '📋';
      default: return '📁';
    }
  }

  getFileColor(type: string): string {
    switch (type) {
      case 'IMAGE': return '#10b981';
      case 'VIDEO': return '#3b82f6';
      case 'AUDIO': return '#8b5cf6';
      case 'PDF': return '#ef4444';
      case 'CERTIFICATE': return '#f59e0b';
      case 'CV': return '#6366f1';
      default: return '#6b7280';
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileExtension(media: Media): string {
    if (media.format) {
      return media.format.toUpperCase();
    }
    if (media.url) {
      const parts = media.url.split('.');
      if (parts.length > 1) {
        const ext = parts[parts.length - 1].split('?')[0];
        if (ext && ext.length < 6) {
          return ext.toUpperCase();
        }
      }
    }
    return media.type || '';
  }

  getDisplayName(media: Media): string {
    if (media.title) {
      const title = media.title;
      if (title.length > 36 || title.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return 'File';
      }
      return title;
    }
    return 'File';
  }

  getFileTypeLabel(type: string): string {
    switch (type) {
      case 'IMAGE': return 'Image';
      case 'VIDEO': return 'Video';
      case 'AUDIO': return 'Audio';
      case 'PDF': return 'PDF Document';
      case 'CERTIFICATE': return 'Certificate';
      case 'CV': return 'CV / Resume';
      default: return 'File';
    }
  }

  getCategoryTitle(type: string): string {
    switch (type) {
      case 'IMAGE': return '📷 Images';
      case 'VIDEO': return '🎥 Videos';
      case 'AUDIO': return '🎵 Audio';
      case 'PDF': return '📄 PDF Documents';
      case 'CERTIFICATE': return '🏆 Certificates';
      case 'CV': return '📋 CV / Resume';
      default: return '📁 Files';
    }
  }

  getCategoryIcon(type: string): string {
    switch (type) {
      case 'IMAGE': return '🖼️';
      case 'VIDEO': return '🎥';
      case 'AUDIO': return '🎵';
      case 'PDF': return '📄';
      case 'CERTIFICATE': return '🏆';
      case 'CV': return '📋';
      default: return '📁';
    }
  }

  getSafeAudioUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}