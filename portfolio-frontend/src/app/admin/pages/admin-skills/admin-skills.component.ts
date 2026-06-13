import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSkillService } from '../../services/admin-skill.service';
import { Skill } from '../../../models/skill.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-skills.component.html',
  styleUrls: ['./admin-skills.component.scss']
})
export class AdminSkillsComponent implements OnInit {
  private skillService = inject(AdminSkillService);

  skills: Skill[] = [];
  loading = true;

  showModal = false;
  isEditing = false;
  selectedSkillId: string | null = null;

  formData: Skill = {
    name: '',
    description: '',
    icon: '',
    priority: 0
  };

  submitting = false;

  showDeleteDialog = false;
  deleteSkillId = '';
  deleteSkillName = '';

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.loading = true;
    this.skillService.getSkills().subscribe({
      next: (res) => {
        this.skills = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load skills:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.selectedSkillId = null;
    this.formData = {
      name: '',
      description: '',
      icon: '',
      priority: 0
    };
    this.showModal = true;
  }

  openEditModal(skill: Skill): void {
    this.isEditing = true;
    this.selectedSkillId = skill.id!;
    this.formData = { ...skill };
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

    if (this.isEditing && this.selectedSkillId) {
      this.skillService.updateSkill(this.selectedSkillId, this.formData).subscribe({
        next: () => {
          this.loadSkills();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to update skill:', err);
          this.submitting = false;
        }
      });
    } else {
      this.skillService.createSkill(this.formData).subscribe({
        next: () => {
          this.loadSkills();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Failed to create skill:', err);
          this.submitting = false;
        }
      });
    }
  }

  openDeleteDialog(id: string, name: string): void {
    this.deleteSkillId = id;
    this.deleteSkillName = name;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.skillService.deleteSkill(this.deleteSkillId).subscribe({
      next: () => {
        this.loadSkills();
        this.showDeleteDialog = false;
      },
      error: (err) => {
        console.error('Failed to delete skill:', err);
        this.showDeleteDialog = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  getIconPreview(icon: string): string {
    if (!icon) return '📌';
    if (icon.startsWith('http')) return '🖼️';
    return icon;
  }
}