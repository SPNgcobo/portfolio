import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ProjectService } from '../../services/project.service';
import { MediaService } from '../../services/media.service';
import { Project } from '../../models/project.model';
import { Media } from '../../models/media.model';
import { CommentSectionComponent } from '../../shared/components/comment-section/comment-section.component';
import { ProjectAccessRequestComponent } from '../../shared/components/project-access-request/project-access-request.component';
import { NotificationService } from '../../shared/services/notification.service';
import { NotificationWebSocketService } from '../../services/notification-websocket.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CommentSectionComponent, ProjectAccessRequestComponent],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private mediaService = inject(MediaService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(NotificationWebSocketService);

  project?: Project;
  relatedProjects: Project[] = [];
  projectMedia: Media[] = [];
  loading = true;
  loadingMedia = true;
  selectedImage: string | null = null;

  projectAccessStatus: string = 'none';

  private wsSubscription: Subscription | null = null;
  private projectId: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    this.projectId = id;
    this.loadProject(id);
    this.loadProjectMedia(id);

    this.projectService.trackView(id).subscribe();

    this.subscribeToWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private subscribeToWebSocket(): void {
    this.wsSubscription = this.webSocketService.onNotificationUpdate().subscribe((event) => {
      if (event.type === 'MEDIA_UPLOADED' ||
        event.type === 'VAULT_MEDIA_CREATED' ||
        event.type === 'MEDIA_DELETED' ||
        event.type === 'MEDIA_UPDATED') {
        if (this.projectId) {
          console.log('🔄 Reloading project media due to:', event.type);
          this.loadProjectMedia(this.projectId);
        }
      }
    });
  }

  private loadProject(id: string): void {
    this.projectService.getById(id).subscribe({
      next: (res) => {
        this.project = res.data;
        this.loadRelated(id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load project:', err);
        this.loading = false;
      }
    });
  }

  private loadProjectMedia(projectId: string): void {
    this.loadingMedia = true;
    this.mediaService.getProjectMedia(projectId).subscribe({
      next: (res) => {
        this.projectMedia = res.data || [];
        this.loadingMedia = false;
        console.log('✅ Project media loaded:', this.projectMedia.length, 'items');
      },
      error: (err) => {
        console.error('Failed to load project media:', err);
        this.loadingMedia = false;
      }
    });
  }

  private loadRelated(id: string): void {
    this.projectService.getRelated(id).subscribe({
      next: (res) => {
        this.relatedProjects = res.data || [];
      },
      error: (err) => console.error('Failed to load related projects:', err)
    });
  }

  likeProject(): void {
    if (!this.project?.id) return;
    this.projectService.toggleLike(this.project.id).subscribe({
      next: (res) => {
        this.project = res.data;
      },
      error: (err) => console.error('Like failed:', err)
    });
  }

  githubClick(): void {
    if (!this.project?.id) return;
    this.projectService.githubClick(this.project.id).subscribe();
  }

  onGithubAccessGranted(url: string): void {
    this.githubClick();
    console.log('GitHub access granted and opened:', url);
    this.notificationService.success('Opening repository...');
  }

  onAccessStatusChanged(status: string): void {
    this.projectAccessStatus = status;
    console.log('Project access status changed to:', status);

    if (status === 'approved') {
      this.notificationService.success('Access granted! You can now view the repository.');
      if (this.project?.id) {
        this.loadProject(this.project.id);
      }
    }
  }

  demoClick(): void {
    if (!this.project?.id) return;
    this.projectService.demoClick(this.project.id).subscribe();
  }

  goBack(): void {
    this.location.back();
  }

  openImage(image: string): void {
    this.selectedImage = image;
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  shareProject(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.notificationService.success('Link copied to clipboard!');
    }).catch(() => {
      this.notificationService.error('Failed to copy link');
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  downloadFile(media: Media): void {
    const filename = media.title || 'file';
    const ext = this.getFileExtension(media);
    const cleanFilename = filename.replace(/[^a-zA-Z0-9\-_\s]/g, '');
    const fullFilename = ext ? `${cleanFilename}.${ext}` : cleanFilename;

    fetch(media.url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fullFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.notificationService.success(`Downloading: ${fullFilename}`);
      })
      .catch(error => {
        console.error('Download failed:', error);
        this.notificationService.warning('Download failed. Opening in new tab...');
        window.open(media.url, '_blank');
      });
  }

  getImages(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'IMAGE' && media.visibility === 'PUBLIC'
    );
  }

  getVideos(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'VIDEO' && media.visibility === 'PUBLIC'
    );
  }

  getAudio(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'AUDIO' && media.visibility === 'PUBLIC'
    );
  }

  getPDFs(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'PDF' && media.visibility === 'PUBLIC'
    );
  }

  getCertificates(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'CERTIFICATE' && media.visibility === 'PUBLIC'
    );
  }

  getCVs(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'CV' && media.visibility === 'PUBLIC'
    );
  }

  hasAnyMedia(): boolean {
    return this.projectMedia.filter(media => media.visibility === 'PUBLIC').length > 0;
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

  refreshProjectStats(): void {
    if (this.projectId) {
      this.projectService.getById(this.projectId).subscribe({
        next: (res) => {
          if (res.data) {
            this.project = {
              ...this.project,
              ...res.data
            };
          }
        },
        error: (err) => {
          console.error('Failed to refresh project stats:', err);
        }
      });
    }
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

  getSafeAudioUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}