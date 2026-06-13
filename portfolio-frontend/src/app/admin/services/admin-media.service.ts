import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Media } from '../../models/media.model';

@Injectable({
  providedIn: 'root'
})
export class AdminMediaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/media`;

  getAllMedia(): Observable<ApiResponse<Media[]>> {
    return this.http.get<ApiResponse<Media[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  getMediaByProject(projectId: string): Observable<ApiResponse<Media[]>> {
    return this.http.get<ApiResponse<Media[]>>(
      `${this.apiUrl}/project/${projectId}`,
      { withCredentials: true }
    );
  }

  createMedia(media: Partial<Media>): Observable<ApiResponse<Media>> {
    return this.http.post<ApiResponse<Media>>(
      `${this.apiUrl}`,
      media,
      { withCredentials: true }
    );
  }

  updateMedia(id: string, media: Partial<Media>): Observable<ApiResponse<Media>> {
    return this.http.put<ApiResponse<Media>>(
      `${this.apiUrl}/${id}`,
      media,
      { withCredentials: true }
    );
  }

  deleteMedia(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}