import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminToolService } from '../../services/admin-tool.service';
import { Tool } from '../../../models/tool.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-tools.component.html',
  styleUrls: ['./admin-tools.component.scss']
})
export class AdminToolsComponent implements OnInit {
  private toolService = inject(AdminToolService);

  tools: Tool[] = [];
  loading = true;

  showModal = false;
  isEditing = false;
  selectedToolId: string | null = null;

  formData: Tool = {
    name: '',
    description: '',
    icon: '',
    priority: 0
  };

  submitting = false;

  showDeleteDialog = false;
  deleteToolId = '';
  deleteToolName = '';

  ngOnInit(): void {
    this.loadTools();
  }

  loadTools(): void {
    this.loading = true;
    this.toolService.getTools().subscribe({
      next: (res) => {
        this.tools = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tools:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedToolId = null;
    this.formData = {
      name: '',
      description: '',
      icon: '',
      priority: 0
    };
    this.showModal = true;
  }

  openEditModal(tool: Tool): void {
    this.isEditing = true;
    this.selectedToolId = tool.id!;
    this.formData = { ...tool };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = {
      name: '',
      description: '',
      icon: '',
      priority: 0
    };
    this.submitting = false;
  }

  submitForm(): void {
    if (!this.formData.name.trim()) {
      return;
    }

    this.submitting = true;

    if (this.isEditing && this.selectedToolId) {
      this.toolService.updateTool(this.selectedToolId, this.formData).subscribe({
        next: () => {
          this.loadTools();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to update tool:', err);
          this.submitting = false;
        }
      });
    } else {
      this.toolService.createTool(this.formData).subscribe({
        next: () => {
          this.loadTools();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to create tool:', err);
          this.submitting = false;
        }
      });
    }
  }

  openDeleteDialog(id: string, name: string): void {
    this.deleteToolId = id;
    this.deleteToolName = name;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.toolService.deleteTool(this.deleteToolId).subscribe({
      next: () => {
        this.loadTools();
        this.showDeleteDialog = false;
      },
      error: (err) => {
        console.error('Failed to delete tool:', err);
        this.showDeleteDialog = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  getIconPreview(icon: string): string {
    if (!icon) return '🔧';
    if (icon.startsWith('http')) return '🖼️';
    return icon;
  }
}