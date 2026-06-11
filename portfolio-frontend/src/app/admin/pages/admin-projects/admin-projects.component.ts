import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminProjectService } from '../../services/admin-project.service';
import { Project } from '../../../models/project.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './admin-projects.component.html',
  styleUrls: ['./admin-projects.component.scss']
})
export class AdminProjectsComponent implements OnInit {
  private projectService = inject(AdminProjectService);

  projects: Project[] = [];
  loading = true;

  // Delete dialog
  showDeleteDialog = false;
  selectedProjectId = '';
  selectedProjectTitle = '';

  // Publish/Unpublish
  updatingId: string | null = null;

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load projects:', err);
        this.loading = false;
      }
    });
  }

  openDeleteDialog(id: string, title: string): void {
    this.selectedProjectId = id;
    this.selectedProjectTitle = title;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.projectService.deleteProject(this.selectedProjectId).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.loadProjects();
      },
      error: (err) => {
        console.error('Failed to delete project:', err);
        this.showDeleteDialog = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  togglePublish(project: Project): void {
    this.updatingId = project.id!;

    const action = project.published
      ? this.projectService.unpublishProject(project.id!)
      : this.projectService.publishProject(project.id!);

    action.subscribe({
      next: (res) => {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          this.projects[index] = res.data;
        }
        this.updatingId = null;
      },
      error: (err) => {
        console.error('Failed to toggle publish status:', err);
        this.updatingId = null;
      }
    });
  }

  toggleFeatured(project: Project): void {
    this.updatingId = project.id!;

    const action = project.featured
      ? this.projectService.unfeatureProject(project.id!)
      : this.projectService.featureProject(project.id!);

    action.subscribe({
      next: (res) => {
        const index = this.projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          this.projects[index] = res.data;
        }
        this.updatingId = null;
      },
      error: (err) => {
        console.error('Failed to toggle featured status:', err);
        this.updatingId = null;
      }
    });
  }
}