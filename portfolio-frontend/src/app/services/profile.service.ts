import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserProfile, ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  getProfile(): Observable<ApiResponse<UserProfileResponse>> {
    return this.http.get<ApiResponse<UserProfileResponse>>(
      `${this.apiUrl}/profile`,
      { withCredentials: true }
    );
  }

  updateUsername(request: UpdateProfileRequest): Observable<ApiResponse<UserProfileResponse>> {
    return this.http.put<ApiResponse<UserProfileResponse>>(
      `${this.apiUrl}/profile/username`,
      request,
      { withCredentials: true }
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/change-password`,
      request,
      { withCredentials: true }
    );
  }
}