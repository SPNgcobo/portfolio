import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProjectService } from '../../services/admin-project.service';
import { Project } from '../../../models/project.model';

@Component({
  selector: 'app-admin-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-project-form.component.html',
  styleUrls: ['./admin-project-form.component.scss']
})
export class AdminProjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private projectService = inject(AdminProjectService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  projectForm!: FormGroup;
  isEdit = false;
  projectId: string | null = null;
  loading = false;
  submitting = false;

  ngOnInit(): void {
    this.initForm();

    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.isEdit = true;
      this.loadProject(this.projectId);
    }
  }

  private initForm(): void {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      shortDescription: ['', [Validators.maxLength(160)]],
      problem: [''],
      architecture: [''],
      challenges: [''],
      solution: [''],
      infoNote: [''],
      github: [''],
      githubVisible: [true],
      liveDemoUrl: [''],
      thumbnail: [''],
      techStack: [''],
      tools: [''],
      features: [''],
      featured: [false],
      published: [false]
    });
  }

  private loadProject(id: string): void {
    this.loading = true;
    this.projectService.getProject(id).subscribe({
      next: (res) => {
        const project = res.data;
        this.projectForm.patchValue({
          title: project.title,
          description: project.description,
          shortDescription: project.shortDescription || '',
          problem: project.problem || '',
          architecture: project.architecture || '',
          challenges: project.challenges || '',
          solution: project.solution || '',
          infoNote: project.infoNote || '',
          github: project.github || '',
          githubVisible: project.githubVisible !== false,
          liveDemoUrl: project.liveDemoUrl || '',
          thumbnail: project.thumbnail || '',
          techStack: (project.techStack || []).join(', '),
          tools: (project.tools || []).join(', '),
          features: (project.features || []).join(', '),
          featured: project.featured || false,
          published: project.published || false
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load project:', err);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.submitting = true;

    const formValue = this.projectForm.value;
    const projectData: Partial<Project> = {
      title: formValue.title,
      description: formValue.description,
      shortDescription: formValue.shortDescription,
      problem: formValue.problem,
      architecture: formValue.architecture,
      challenges: formValue.challenges,
      solution: formValue.solution,
      infoNote: formValue.infoNote,
      github: formValue.github,
      githubVisible: formValue.githubVisible,
      liveDemoUrl: formValue.liveDemoUrl,
      thumbnail: formValue.thumbnail,
      techStack: formValue.techStack ? formValue.techStack.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      tools: formValue.tools ? formValue.tools.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      features: formValue.features ? formValue.features.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
      featured: formValue.featured,
      published: formValue.published
    };

    if (this.isEdit && this.projectId) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/projects']);
        },
        error: (err) => {
          console.error('Failed to update project:', err);
          this.submitting = false;
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/projects']);
        },
        error: (err) => {
          console.error('Failed to create project:', err);
          this.submitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/projects']);
  }
}