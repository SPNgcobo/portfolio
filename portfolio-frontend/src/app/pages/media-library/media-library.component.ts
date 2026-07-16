import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MediaService } from '../../services/media.service';
import { AuthService } from '../../auth/services/auth.service';
import { Media } from '../../models/media.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './media-library.component.html',
  styleUrls: ['./media-library.component.scss']
})
export class MediaLibraryComponent implements OnInit, OnDestroy {
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  publicMedia: Media[] = [];
  loading = true;
  private refreshInterval: any;

  ngOnInit(): void {
    this.loadPublicMedia();

    this.refreshInterval = setInterval(() => {
      this.loadPublicMediaSilently();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadPublicMedia(): void {
    this.loading = true;
    this.mediaService.getAllPublicMedia().subscribe({
      next: (res) => {
        this.publicMedia = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load public media:', err);
        this.loading = false;
      }
    });
  }

  private loadPublicMediaSilently(): void {
    this.mediaService.getAllPublicMedia().subscribe({
      next: (res) => {
        this.publicMedia = res.data || [];
      },
      error: (err) => {
        console.error('Failed to load public media silently:', err);
      }
    });
  }


  getImages(): Media[] {
    return this.publicMedia.filter(media => media.type === 'IMAGE');
  }

  getVideos(): Media[] {
    return this.publicMedia.filter(media => media.type === 'VIDEO');
  }

  getAudio(): Media[] {
    return this.publicMedia.filter(media => media.type === 'AUDIO');
  }

  getPDFs(): Media[] {
    return this.publicMedia.filter(media => media.type === 'PDF');
  }

  getCertificates(): Media[] {
    return this.publicMedia.filter(media => media.type === 'CERTIFICATE');
  }

  getCVs(): Media[] {
    return this.publicMedia.filter(media => media.type === 'CV');
  }

  hasAnyMedia(): boolean {
    return this.publicMedia.length > 0;
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
      })
      .catch(error => {
        console.error('Download failed:', error);
        window.open(media.url, '_blank');
      });
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