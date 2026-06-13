import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Media } from '../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/media`;

  getProjectMedia(projectId: string): Observable<ApiResponse<Media[]>> {
    return this.http.get<ApiResponse<Media[]>>(
      `${this.apiUrl}/project/${projectId}/public`
    );
  }

  getMediaById(id: string, email?: string): Observable<ApiResponse<Media>> {
    const params = email ? `?email=${email}` : '';
    return this.http.get<ApiResponse<Media>>(`${this.apiUrl}/${id}${params}`);
  }
}