import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Project } from '../models/project.model';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private baseUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  getAll(page = 0, size = 10): Observable<ApiResponse<PageResponse<Project>>> {
    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.baseUrl}?page=${page}&size=${size}`
    );
  }

  getById(id: string): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(
      `${this.baseUrl}/${id}`
    );
  }

  getRelated(id: string): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(
      `${this.baseUrl}/${id}/related`
    );
  }

  trackView(id: string): Observable<ApiResponse<Project> | null> {

    const key = `project_view_${id}`;

    const lastViewed = localStorage.getItem(key);

    if (lastViewed) {

      const diff =
        Date.now() - Number(lastViewed);

      const ONE_DAY =
        24 * 60 * 60 * 1000;

      if (diff < ONE_DAY) {
        return of(null);
      }
    }

    return this.http.post<ApiResponse<Project>>(
      `${this.baseUrl}/${id}/view`,
      {}
    ).pipe(

      map(response => {

        localStorage.setItem(
          key,
          Date.now().toString()
        );

        return response;
      })
    );
  }

  toggleLike(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.baseUrl}/${id}/like`,
      {}
    );
  }

  githubClick(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.baseUrl}/${id}/github-click`,
      {}
    );
  }

  demoClick(id: string): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      `${this.baseUrl}/${id}/demo-click`,
      {}
    );
  }

  create(project: Project): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(
      this.baseUrl,
      project
    );
  }

  update(id: string, project: Project): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(
      `${this.baseUrl}/${id}`,
      project
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}`
    );
  }
}