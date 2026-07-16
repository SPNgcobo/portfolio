import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Tag } from '../models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class AdminTagService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tags`;

  getAllTags(): Observable<ApiResponse<Tag[]>> {
    return this.http.get<ApiResponse<Tag[]>>(this.apiUrl);
  }

  getPopularTags(): Observable<ApiResponse<Tag[]>> {
    return this.http.get<ApiResponse<Tag[]>>(`${this.apiUrl}/popular`);
  }

  getTag(id: string): Observable<ApiResponse<Tag>> {
    return this.http.get<ApiResponse<Tag>>(`${this.apiUrl}/${id}`);
  }

  createTag(tag: Partial<Tag>): Observable<ApiResponse<Tag>> {
    return this.http.post<ApiResponse<Tag>>(
      `${this.apiUrl}/admin`,
      tag,
      { withCredentials: true }
    );
  }

  updateTag(id: string, tag: Partial<Tag>): Observable<ApiResponse<Tag>> {
    return this.http.put<ApiResponse<Tag>>(
      `${this.apiUrl}/admin/${id}`,
      tag,
      { withCredentials: true }
    );
  }

  deleteTag(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/admin/${id}`,
      { withCredentials: true }
    );
  }
}