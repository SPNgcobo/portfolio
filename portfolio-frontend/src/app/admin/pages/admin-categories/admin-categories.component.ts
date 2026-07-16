import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCategoryService } from '../../services/admin-category.service';
import { Category } from '../../models/category.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(AdminCategoryService);
  private notificationService = inject(NotificationService);

  categories: Category[] = [];
  loading = true;

  showModal = false;
  isEditing = false;
  selectedCategoryId: string | null = null;

  formData: Category = {
    name: '',
    description: '',
    icon: ''
  };

  submitting = false;

  showDeleteDialog = false;
  deleteCategoryId = '';
  deleteCategoryName = '';

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.loading = false;
        this.notificationService.error('Failed to load categories');
      }
    });
  }

  getTotalCategories(): number {
    return this.categories.length;
  }

  getUsedCategoriesCount(): number {
    return this.categories.filter(c => (c.usageCount || 0) > 0).length;
  }

  getUnusedCategoriesCount(): number {
    return this.categories.filter(c => (c.usageCount || 0) === 0).length;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedCategoryId = null;
    this.formData = { name: '', description: '', icon: '' };
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.isEditing = true;
    this.selectedCategoryId = category.id!;
    this.formData = { ...category };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = { name: '', description: '', icon: '' };
    this.submitting = false;
  }

  submitForm(): void {
    if (!this.formData.name.trim()) {
      this.notificationService.error('Category name is required');
      return;
    }

    this.submitting = true;

    if (this.isEditing && this.selectedCategoryId) {
      this.categoryService.updateCategory(this.selectedCategoryId, this.formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.notificationService.success('Category updated successfully');
        },
        error: (err) => {
          console.error('Failed to update category:', err);
          this.submitting = false;
          this.notificationService.error('Failed to update category');
        }
      });
    } else {
      this.categoryService.createCategory(this.formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.notificationService.success('Category created successfully');
        },
        error: (err) => {
          console.error('Failed to create category:', err);
          this.submitting = false;
          this.notificationService.error('Failed to create category');
        }
      });
    }
  }

  openDeleteDialog(id: string, name: string): void {
    this.deleteCategoryId = id;
    this.deleteCategoryName = name;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.categoryService.deleteCategory(this.deleteCategoryId).subscribe({
      next: () => {
        this.loadCategories();
        this.showDeleteDialog = false;
        this.notificationService.success('Category deleted successfully');
      },
      error: (err) => {
        console.error('Failed to delete category:', err);
        this.showDeleteDialog = false;
        this.notificationService.error('Failed to delete category');
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

  getIconPreview(icon: string | undefined): string {
    if (!icon) return '📂';
    if (icon.startsWith('http')) return '🖼️';
    return icon;
  }
}