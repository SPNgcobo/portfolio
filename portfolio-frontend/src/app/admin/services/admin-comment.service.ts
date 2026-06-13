import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Comment } from '../../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class AdminCommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  getPendingComments(): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(
      `${this.apiUrl}/pending`,
      { withCredentials: true }
    );
  }

  getProjectComments(projectId: string): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(
      `${this.apiUrl}/project/${projectId}`,
      { withCredentials: true }
    );
  }

  approveComment(id: string): Observable<ApiResponse<Comment>> {
    return this.http.put<ApiResponse<Comment>>(
      `${this.apiUrl}/${id}/approve`,
      {},
      { withCredentials: true }
    );
  }

  deleteComment(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  replyToComment(parentId: string, content: string, username: string, email: string): Observable<ApiResponse<Comment>> {
    const reply = {
      content: content,
      username: username,
      email: email,
      adminReply: true,
      approved: true
    };
    return this.http.post<ApiResponse<Comment>>(
      `${this.apiUrl}/${parentId}/reply`,
      reply,
      { withCredentials: true }
    );
  }
}