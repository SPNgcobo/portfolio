import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project } from '../../models/project.model';
import type { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/projects`;
  private projectsApiUrl = `${environment.apiUrl}/projects`;

  // Get all projects (admin view - includes unpublished)
  getProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  // Get single project by ID (admin view)
  getProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  // Create new project
  createProject(project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.projectsApiUrl}`,
      project,
      { withCredentials: true }
    );
  }

  // Update existing project
  updateProject(id: string, project: Partial<Project>): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(
      `${this.projectsApiUrl}/${id}`,
      project,
      { withCredentials: true }
    );
  }

  // Delete project
  deleteProject(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.projectsApiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  // Publish project
  publishProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/publish`,
      {},
      { withCredentials: true }
    );
  }

  // Unpublish project
  unpublishProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/unpublish`,
      {},
      { withCredentials: true }
    );
  }

  // Feature project
  featureProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/feature`,
      {},
      { withCredentials: true }
    );
  }

  // Unfeature project
  unfeatureProject(id: string): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/unfeature`,
      {},
      { withCredentials: true }
    );
  }

  // Get unpublished projects
  getUnpublishedProjects(page = 0, size = 10): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/unpublished?page=${page}&size=${size}`,
      { withCredentials: true }
    );
  }

  // Get project analytics
  getProjectAnalytics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/analytics`,
      { withCredentials: true }
    );
  }
}