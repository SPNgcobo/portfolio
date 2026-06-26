import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  getProjectComments(projectId: string): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.apiUrl}/project/${projectId}`);
  }

  createComment(comment: Partial<Comment>): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(
      `${this.apiUrl}`,
      comment,
      { withCredentials: true }
    );
  }

  editComment(id: string, content: string, email: string): Observable<ApiResponse<Comment>> {
    return this.http.put<ApiResponse<Comment>>(
      `${this.apiUrl}/${id}/edit?email=${encodeURIComponent(email)}`,
      { content },
      { withCredentials: true }
    );
  }

  deleteComment(id: string, email: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}?email=${encodeURIComponent(email)}`,
      { withCredentials: true }
    );
  }
}