import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
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
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  project?: Project;
  relatedProjects: Project[] = [];
  loading = true;
  selectedImage: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      return;
    }
    this.loadProject(id);
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
}