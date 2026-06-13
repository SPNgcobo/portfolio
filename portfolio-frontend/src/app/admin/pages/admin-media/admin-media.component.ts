import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMediaService } from '../../services/admin-media.service';
import { UploadService } from '../../../services/upload.service';
import { ProjectService } from '../../../services/project.service';
import { Media, MediaType, VisibilityType } from '../../../models/media.model';
import { Project } from '../../../models/project.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-media.component.html',
  styleUrls: ['./admin-media.component.scss']
})
export class AdminMediaComponent implements OnInit {
  private mediaService = inject(AdminMediaService);
  private uploadService = inject(UploadService);
  private projectService = inject(ProjectService);
  private sanitizer = inject(DomSanitizer);

  mediaItems: Media[] = [];
  projects: Project[] = [];
  filteredMedia: Media[] = [];
  loading = true;
  uploading = false;

  selectedProjectId: string = '';
  selectedType: string = '';
  selectedVisibility: string = '';

  showModal = false;
  isEditing = false;
  selectedMediaId: string | null = null;

  formData: Partial<Media> = {
    projectId: '',
    title: '',
    description: '',
    url: '',
    publicId: '',
    type: 'IMAGE',
    visibility: 'PUBLIC',
    size: 0,
    format: ''
  };

  selectedFile: File | null = null;
  uploadPreview: string | null = null;
  uploadPreviewType: string = '';
  videoPreviewUrl: SafeResourceUrl | null = null;
  audioPreviewUrl: SafeResourceUrl | null = null;

  submitting = false;

  showDeleteDialog = false;
  deleteMediaId = '';
  deleteMediaTitle = '';

  mediaTypes: MediaType[] = ['IMAGE', 'VIDEO', 'AUDIO', 'PDF', 'CERTIFICATE', 'CV'];
  visibilityTypes: VisibilityType[] = ['PUBLIC', 'PRIVATE', 'VAULT'];

  ngOnInit(): void {
    this.loadProjects();
    this.loadMedia();
  }

  loadProjects(): void {
    this.projectService.getAll(0, 100).subscribe({
      next: (res) => {
        this.projects = res.data.content || [];
      },
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

  loadMedia(): void {
    this.loading = true;
    this.mediaService.getAllMedia().subscribe({
      next: (res) => {
        this.mediaItems = res.data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load media:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredMedia = this.mediaItems.filter(media => {
      const matchesProject = !this.selectedProjectId || media.projectId === this.selectedProjectId;
      const matchesType = !this.selectedType || media.type === this.selectedType;
      const matchesVisibility = !this.selectedVisibility || media.visibility === this.selectedVisibility;
      return matchesProject && matchesType && matchesVisibility;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedProjectId = '';
    this.selectedType = '';
    this.selectedVisibility = '';
    this.applyFilters();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const fileType = this.selectedFile.type;
      const fileName = this.selectedFile.name;

      this.uploadPreview = null;
      this.videoPreviewUrl = null;
      this.audioPreviewUrl = null;
      this.uploadPreviewType = '';

      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadPreview = reader.result as string;
          this.uploadPreviewType = 'image';
        };
        reader.readAsDataURL(this.selectedFile);
        this.formData.type = 'IMAGE';
      }
      else if (fileType.startsWith('video/')) {
        this.videoPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.selectedFile));
        this.uploadPreviewType = 'video';
        this.formData.type = 'VIDEO';
      }
      else if (fileType.startsWith('audio/')) {
        this.audioPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.selectedFile));
        this.uploadPreviewType = 'audio';
        this.formData.type = 'AUDIO';
      }
      else if (fileType === 'application/pdf') {
        this.uploadPreview = '/assets/pdf-icon.png'; 
        this.uploadPreviewType = 'pdf';
        this.formData.type = 'PDF';
      }
      else if (fileType.includes('msword') || fileType.includes('document') || fileType.includes('spreadsheet')) {
        this.uploadPreviewType = 'document';
        if (fileName.match(/certificate|cert/i)) {
          this.formData.type = 'CERTIFICATE';
        } else if (fileName.match(/cv|resume/i)) {
          this.formData.type = 'CV';
        } else {
          this.formData.type = 'PDF';
        }
      }
      else {
        this.uploadPreviewType = 'file';
        if (fileName.endsWith('.pdf')) {
          this.formData.type = 'PDF';
        } else if (fileName.match(/certificate|cert/i)) {
          this.formData.type = 'CERTIFICATE';
        } else if (fileName.match(/cv|resume/i)) {
          this.formData.type = 'CV';
        }
      }

      this.uploadFile();
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        this.formData.url = res.data.url;
        this.formData.publicId = res.data.publicId;
        this.formData.size = this.selectedFile!.size;
        this.formData.format = this.selectedFile!.type.split('/')[1] || '';
        this.uploading = false;
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.uploading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedMediaId = null;
    this.formData = {
      projectId: '',
      title: '',
      description: '',
      url: '',
      publicId: '',
      type: 'IMAGE',
      visibility: 'PUBLIC',
      size: 0,
      format: ''
    };
    this.selectedFile = null;
    this.uploadPreview = null;
    this.videoPreviewUrl = null;
    this.audioPreviewUrl = null;
    this.uploadPreviewType = '';
    this.showModal = true;
  }

  openEditModal(media: Media): void {
    this.isEditing = true;
    this.selectedMediaId = media.id!;
    this.formData = { ...media };
    this.uploadPreview = media.url;
    this.uploadPreviewType = media.type === 'IMAGE' ? 'image' : (media.type === 'VIDEO' ? 'video' : 'file');
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedFile = null;
    this.uploadPreview = null;
    this.videoPreviewUrl = null;
    this.audioPreviewUrl = null;
    this.uploadPreviewType = '';
    this.submitting = false;
  }

  async submitForm(): Promise<void> {
    if (!this.formData.title || !this.formData.projectId) {
      return;
    }

    if (this.selectedFile && !this.isEditing && !this.formData.url) {
      await this.uploadFile();
      if (!this.formData.url) return;
    }

    this.submitting = true;

    if (this.isEditing && this.selectedMediaId) {
      this.mediaService.updateMedia(this.selectedMediaId, this.formData).subscribe({
        next: () => {
          this.loadMedia();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to update media:', err);
          this.submitting = false;
        }
      });
    } else {
      this.mediaService.createMedia(this.formData).subscribe({
        next: () => {
          this.loadMedia();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to create media:', err);
          this.submitting = false;
        }
      });
    }
  }

  openDeleteDialog(id: string, title: string): void {
    this.deleteMediaId = id;
    this.deleteMediaTitle = title;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.mediaService.deleteMedia(this.deleteMediaId).subscribe({
      next: () => {
        this.loadMedia();
        this.showDeleteDialog = false;
      },
      error: (err) => {
        console.error('Failed to delete media:', err);
        this.showDeleteDialog = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project?.title || 'Unknown Project';
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

  formatFileSize(bytes: number): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getPreviewIcon(type: string): string {
    switch (type) {
      case 'pdf': return '📕';
      case 'document': return '📘';
      case 'file': return '📄';
      default: return '📁';
    }
  }

  removeSelectedFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.uploadPreview = null;
    this.videoPreviewUrl = null;
    this.audioPreviewUrl = null;
    this.uploadPreviewType = '';
    this.formData.url = '';
    this.formData.publicId = '';
  }
}