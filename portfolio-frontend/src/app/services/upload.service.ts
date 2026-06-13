import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface UploadResponse {
  url: string;
  publicId: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/uploads`;

  uploadFile(file: File): Observable<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<UploadResponse>>(
      `${this.apiUrl}`,
      formData,
      { withCredentials: true }
    );
  }

  deleteFile(publicId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}?publicId=${publicId}`,
      { withCredentials: true }
    );
  }
}