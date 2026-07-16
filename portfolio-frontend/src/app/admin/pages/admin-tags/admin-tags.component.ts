import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTagService } from '../../services/admin-tag.service';
import { Tag } from '../../models/tag.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-tags',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-tags.component.html',
  styleUrls: ['./admin-tags.component.scss']
})
export class AdminTagsComponent implements OnInit {
  private tagService = inject(AdminTagService);
  private notificationService = inject(NotificationService);

  tags: Tag[] = [];
  loading = true;

  showModal = false;
  isEditing = false;
  selectedTagId: string | null = null;

  formData: Tag = {
    name: '',
    description: ''
  };

  submitting = false;

  showDeleteDialog = false;
  deleteTagId = '';
  deleteTagName = '';

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.loading = true;
    this.tagService.getAllTags().subscribe({
      next: (res) => {
        this.tags = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tags:', err);
        this.loading = false;
        this.notificationService.error('Failed to load tags');
      }
    });
  }

  getTotalTags(): number {
    return this.tags.length;
  }

  getUsedTagsCount(): number {
    return this.tags.filter(t => (t.usageCount || 0) > 0).length;
  }

  getUnusedTagsCount(): number {
    return this.tags.filter(t => (t.usageCount || 0) === 0).length;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedTagId = null;
    this.formData = { name: '', description: '' };
    this.showModal = true;
  }

  openEditModal(tag: Tag): void {
    this.isEditing = true;
    this.selectedTagId = tag.id!;
    this.formData = { ...tag };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = { name: '', description: '' };
    this.submitting = false;
  }

  submitForm(): void {
    if (!this.formData.name.trim()) {
      this.notificationService.error('Tag name is required');
      return;
    }

    this.submitting = true;

    if (this.isEditing && this.selectedTagId) {
      this.tagService.updateTag(this.selectedTagId, this.formData).subscribe({
        next: () => {
          this.loadTags();
          this.closeModal();
          this.notificationService.success('Tag updated successfully');
        },
        error: (err) => {
          console.error('Failed to update tag:', err);
          this.submitting = false;
          this.notificationService.error('Failed to update tag');
        }
      });
    } else {
      this.tagService.createTag(this.formData).subscribe({
        next: () => {
          this.loadTags();
          this.closeModal();
          this.notificationService.success('Tag created successfully');
        },
        error: (err) => {
          console.error('Failed to create tag:', err);
          this.submitting = false;
          this.notificationService.error('Failed to create tag');
        }
      });
    }
  }

  openDeleteDialog(id: string, name: string): void {
    this.deleteTagId = id;
    this.deleteTagName = name;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.tagService.deleteTag(this.deleteTagId).subscribe({
      next: () => {
        this.loadTags();
        this.showDeleteDialog = false;
        this.notificationService.success('Tag deleted successfully');
      },
      error: (err) => {
        console.error('Failed to delete tag:', err);
        this.showDeleteDialog = false;
        this.notificationService.error('Failed to delete tag');
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  getUsageColor(usageCount: number): string {
    if (usageCount === 0) return 'zero';
    if (usageCount < 5) return 'low';
    if (usageCount < 20) return 'medium';
    return 'high';
  }
}