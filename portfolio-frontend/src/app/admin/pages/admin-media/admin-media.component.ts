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

  formData: any = {
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

  isProjectSelected = false;

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

  onProjectChange(): void {
    this.isProjectSelected = this.formData.projectId && this.formData.projectId.trim() !== '';

    if (this.isProjectSelected) {
      this.formData.visibility = 'PUBLIC';
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedMediaId = null;
    this.isProjectSelected = false;
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

    this.isProjectSelected = media.projectId !== null && media.projectId !== '';

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
    this.isProjectSelected = false;
  }

  async submitForm(): Promise<void> {
    if (!this.formData.title) {
      return;
    }

    if (this.selectedFile && !this.isEditing && !this.formData.url) {
      await this.uploadFile();
      if (!this.formData.url) return;
    }

    const submitData: any = {
      title: this.formData.title,
      description: this.formData.description || '',
      url: this.formData.url,
      publicId: this.formData.publicId,
      type: this.formData.type,
      visibility: this.formData.visibility,
      size: this.formData.size || 0,
      format: this.formData.format || ''
    };

    if (this.formData.projectId && this.formData.projectId.trim() !== '') {
      submitData.projectId = this.formData.projectId;
      submitData.visibility = 'PUBLIC';
    } else {
      submitData.projectId = null;
    }

    this.submitting = true;

    if (this.isEditing && this.selectedMediaId) {
      this.mediaService.updateMedia(this.selectedMediaId, submitData).subscribe({
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
      this.mediaService.createMedia(submitData).subscribe({
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


  getImages(): Media[] {
    return this.filteredMedia.filter(media => media.type === 'IMAGE');
  }

  getVideos(): Media[] {
    return this.filteredMedia.filter(media => media.type === 'VIDEO');
  }

  getAudio(): Media[] {
    return this.filteredMedia.filter(media => media.type === 'AUDIO');
  }

  getPDFs(): Media[] {
    return this.filteredMedia.filter(media => media.type === 'PDF');
  }

  getCertificates(): Media[] {
    return this.filteredMedia.filter(media => media.type === 'CERTIFICATE');
  }

  getCVs(): Media[] {
    return this.filteredMedia.filter(media => media.type === 'CV');
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


  getVisibilityIcon(visibility: string): string {
    switch (visibility) {
      case 'PUBLIC': return '🌐';
      case 'PRIVATE': return '🔒';
      case 'VAULT': return '🔐';
      default: return '📌';
    }
  }

  getVisibilityTooltip(visibility: string): string {
    switch (visibility) {
      case 'PUBLIC': return 'Visible to everyone';
      case 'PRIVATE': return 'Admin only - not visible to users';
      case 'VAULT': return 'Users can request access';
      default: return '';
    }
  }

  getVisibilityHint(visibility: string, isProjectBased: boolean): string {
    if (isProjectBased) {
      return '🔒 Forced to PUBLIC when linked to a project';
    }
    switch (visibility) {
      case 'PUBLIC': return '🌐 Visible to everyone';
      case 'PRIVATE': return '🔒 Admin only - not visible to users';
      case 'VAULT': return '🔐 Users can request access';
      default: return '';
    }
  }

  getProjectName(projectId: string | null): string {
    if (!projectId) return 'Standalone (No Project)';
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

  getPreviewIcon(type: string): string {
    switch (type) {
      case 'pdf': return '📕';
      case 'document': return '📘';
      case 'file': return '📄';
      default: return '📁';
    }
  }

  getSafeAudioUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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