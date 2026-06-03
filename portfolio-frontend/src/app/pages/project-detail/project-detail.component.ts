import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {

  project?: Project;

  relatedProjects: Project[] = [];

  loading = true;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private location: Location
  ) { }

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

    this.projectService.getById(id)
      .subscribe({

        next: (res) => {

          this.project = res.data;

          this.loadRelated(id);

          this.loading = false;
        },

        error: (err) => {

          console.error(err);

          this.loading = false;
        }
      });
  }

  private loadRelated(id: string): void {

    this.projectService.getRelated(id)
      .subscribe({

        next: (res) => {
          this.relatedProjects = res.data || [];
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  likeProject(): void {

    if (!this.project?.id) {
      return;
    }

    this.projectService.toggleLike(this.project.id)
      .subscribe({

        next: (res) => {
          this.project = res.data;
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  githubClick(): void {

    if (!this.project?.id) {
      return;
    }

    this.projectService.githubClick(this.project.id)
      .subscribe();
  }

  demoClick(): void {

    if (!this.project?.id) {
      return;
    }

    this.projectService.demoClick(this.project.id)
      .subscribe();
  }

  goBack(): void {
    this.location.back();
  }
}