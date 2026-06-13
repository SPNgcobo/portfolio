import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProjectService } from '../../services/project.service';
import { MediaService } from '../../services/media.service';
import { Project } from '../../models/project.model';
import { Media } from '../../models/media.model';
import { CommentSectionComponent } from '../../shared/components/comment-section/comment-section.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CommentSectionComponent],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  private projectService = inject(ProjectService);
  private mediaService = inject(MediaService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private sanitizer = inject(DomSanitizer);

  project?: Project;
  relatedProjects: Project[] = [];
  projectMedia: Media[] = [];
  loading = true;
  loadingMedia = true;
  selectedImage: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    this.loadProject(id);
    this.loadProjectMedia(id);
    this.projectService.trackView(id).subscribe();
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
      console.log('Link copied');
    }).catch(() => {
      console.error('Copy failed');
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getImages(): Media[] {
    return this.projectMedia.filter(media => media.type === 'IMAGE');
  }

  getVideos(): Media[] {
    return this.projectMedia.filter(media => media.type === 'VIDEO');
  }

  getAudio(): Media[] {
    return this.projectMedia.filter(media => media.type === 'AUDIO');
  }

  getDocuments(): Media[] {
    return this.projectMedia.filter(media =>
      media.type === 'PDF' || media.type === 'CERTIFICATE' || media.type === 'CV'
    );
  }

  getDocumentIcon(type: string): string {
    switch (type) {
      case 'PDF': return '📕';
      case 'CERTIFICATE': return '🏆';
      case 'CV': return '📋';
      default: return '📄';
    }
  }

  getSafeAudioUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}