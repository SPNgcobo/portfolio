import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  trigger,
  style,
  animate,
  transition,
  stagger,
  query
} from '@angular/animations';

import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],

  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query('.project-card', [
          style({
            opacity: 0,
            transform: 'translateY(40px)'
          }),

          stagger(150, [
            animate('500ms ease-out', style({
              opacity: 1,
              transform: 'translateY(0)'
            }))
          ])
        ])
      ])
    ])
  ]
})
export class ProjectsComponent implements OnInit {

  projects: Project[] = [];
  loading = true;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    this.projectService.getAll().subscribe({
      next: (res) => {
        console.log('API RESPONSE:', res);

        this.projects = res?.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.projects = [];
        this.loading = false;
      }
    });
  }
}