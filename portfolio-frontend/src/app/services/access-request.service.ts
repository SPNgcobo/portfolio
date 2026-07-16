import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AccessRequest } from '../models/access-request';
import { AuthService } from '../auth/services/auth.service';  

@Injectable({
  providedIn: 'root'
})
export class AccessRequestService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);  
  private apiUrl = `${environment.apiUrl}/access-requests`;

  createRequest(request: Partial<AccessRequest>): Observable<ApiResponse<AccessRequest>> {
    return this.http.post<ApiResponse<AccessRequest>>(
      `${this.apiUrl}`,
      request,
      { withCredentials: true }
    );
  }

  getAllRequests(): Observable<ApiResponse<AccessRequest[]>> {
    return this.http.get<ApiResponse<AccessRequest[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  getPendingRequests(): Observable<ApiResponse<AccessRequest[]>> {
    return this.http.get<ApiResponse<AccessRequest[]>>(
      `${this.apiUrl}/pending`,
      { withCredentials: true }
    );
  }

  getUserRequests(): Observable<ApiResponse<AccessRequest[]>> {
    return this.http.get<ApiResponse<AccessRequest[]>>(
      `${this.apiUrl}/user/me`,
      { withCredentials: true }
    );
  }

  getUserProjectRequest(projectId: string): Observable<ApiResponse<AccessRequest>> {
    return this.http.get<ApiResponse<AccessRequest>>(
      `${this.apiUrl}/user/me/project/${projectId}`,
      { withCredentials: true }
    );
  }

  checkProjectAccess(projectId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/user/me/project/${projectId}/access`,
      { withCredentials: true }
    );
  }

  approveRequest(id: string, adminMessage?: string): Observable<ApiResponse<AccessRequest>> {
    return this.http.put<ApiResponse<AccessRequest>>(
      `${this.apiUrl}/${id}/approve`,
      { adminMessage },
      { withCredentials: true }
    );
  }

  rejectRequest(id: string, adminMessage?: string): Observable<ApiResponse<AccessRequest>> {
    return this.http.put<ApiResponse<AccessRequest>>(
      `${this.apiUrl}/${id}/reject`,
      { adminMessage },
      { withCredentials: true }
    );
  }

  getGithubUrl(projectId: string): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(
      `${environment.apiUrl}/projects/${projectId}/github`,
      { withCredentials: true }
    );
  }

  checkMediaAccess(mediaId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(
      `${this.apiUrl}/user/me/media/${mediaId}/access`,
      { withCredentials: true }
    );
  }

  getUserMediaRequest(mediaId: string): Observable<ApiResponse<AccessRequest>> {
    return this.http.get<ApiResponse<AccessRequest>>(
      `${this.apiUrl}/user/me/media/${mediaId}`,
      { withCredentials: true }
    );
  }

  createMediaRequest(mediaId: string, reason: string): Observable<ApiResponse<AccessRequest>> {
    const currentUser = this.authService.getCurrentUser();
    const request: Partial<AccessRequest> = {
      name: currentUser?.email?.split('@')[0] || 'User',
      email: currentUser?.email || '',
      reason: reason,
      mediaId: mediaId,
      requestType: 'MEDIA'
    };
    return this.createRequest(request);
  }
}