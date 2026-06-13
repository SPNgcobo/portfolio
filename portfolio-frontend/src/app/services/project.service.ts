import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Project } from '../models/project.model';
import type { PageResponse } from '../models/page-response';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  getAll(page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  getById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`);
  }

  getRelated(id: string): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/${id}/related`);
  }

  trackView(id: string): Observable<ApiResponse<Project> | null> {
    const key = `project_view_${id}`;
    const lastViewed = localStorage.getItem(key);

    if (lastViewed) {
      const diff = Date.now() - Number(lastViewed);
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (diff < ONE_DAY) {
        return of(null);
      }
    }

    return this.http.post<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/view`,
      {}
    ).pipe(
      map(response => {
        localStorage.setItem(key, Date.now().toString());
        return response;
      })
    );
  }

  toggleLike(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/like`,
      {}
    );
  }

  githubClick(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/github-click`,
      {}
    );
  }

  demoClick(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/demo-click`,
      {}
    );
  }

  detailClick(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.apiUrl}/${id}/detail-click`,
      {}
    );
  }

  search(keyword: string, page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.apiUrl}/search?q=${keyword}&page=${page}&size=${size}`
    );
  }

  getFeatured(page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.apiUrl}/featured?page=${page}&size=${size}`
    );
  }

  getByTechStack(tech: string, page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.apiUrl}/tech-stack/${tech}?page=${page}&size=${size}`
    );
  }

  getByTool(tool: string, page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.apiUrl}/tool/${tool}?page=${page}&size=${size}`
    );
  }
}