import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getAll(
    page = 0,
    size = 10
  ): Observable<ApiResponse<PageResponse<Project>>> {

    return this.http.get<ApiResponse<PageResponse<Project>>>(
      `${this.baseUrl}?page=${page}&size=${size}`
    );

  }

  getById(
    id: string
  ): Observable<ApiResponse<Project>> {

    return this.http.get<ApiResponse<Project>>(
      `${this.baseUrl}/${id}`
    );


  }

  incrementView(
    id: string
  ): Observable<ApiResponse<Project>> {

    return this.http.post<ApiResponse<Project>>(
      `${this.baseUrl}/${id}/view`,
      {}
    );


  }

  toggleLike(
    id: string
  ): Observable<ApiResponse<Project>> {

    return this.http.post<ApiResponse<Project>>(
      `${this.baseUrl}/${id}/like`,
      {}
    );

  }

  create(
    project: Project
  ): Observable<ApiResponse<Project>> {

    return this.http.post<ApiResponse<Project>>(
      this.baseUrl,
      project
    );

  }

  update(
    id: string,
    project: Project
  ): Observable<ApiResponse<Project>> {

    return this.http.put<ApiResponse<Project>>(
      `${this.baseUrl}/${id}`,
      project
    );


  }

  delete(
    id: string
  ): Observable<ApiResponse<void>> {

    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/${id}`
    );

  }
}
