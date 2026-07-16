import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { GlobalSearchResponse } from '../models/search-response.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/search`;

  globalSearch(
    keyword: string,
    page: number = 0,
    size: number = 5
  ): Observable<ApiResponse<GlobalSearchResponse>> {
    return this.http.get<ApiResponse<GlobalSearchResponse>>(
      `${this.apiUrl}?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
  }
}