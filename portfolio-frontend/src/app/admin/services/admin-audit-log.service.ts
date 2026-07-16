import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { AuditLog } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAuditLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/audit-logs`;

  getRecentLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }
}