import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Tool } from '../models/tool.model';

@Injectable({
  providedIn: 'root'
})
export class ToolService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tools`;

  getAllTools(): Observable<ApiResponse<Tool[]>> {
    return this.http.get<ApiResponse<Tool[]>>(this.apiUrl);
  }
}