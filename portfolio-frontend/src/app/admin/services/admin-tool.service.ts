import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Tool } from '../../models/tool.model';

@Injectable({
  providedIn: 'root'
})
export class AdminToolService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tools`;

  getTools(): Observable<ApiResponse<Tool[]>> {
    return this.http.get<ApiResponse<Tool[]>>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  createTool(tool: Partial<Tool>): Observable<ApiResponse<Tool>> {
    return this.http.post<ApiResponse<Tool>>(
      `${this.apiUrl}`,
      tool,
      { withCredentials: true }
    );
  }

  updateTool(id: string, tool: Partial<Tool>): Observable<ApiResponse<Tool>> {
    return this.http.put<ApiResponse<Tool>>(
      `${this.apiUrl}/${id}`,
      tool,
      { withCredentials: true }
    );
  }

  deleteTool(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}