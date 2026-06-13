import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Blog } from '../models/blog.model';
import type { PageResponse } from '../models/page-response';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/blogs`;

  getBlogs(page = 0, size = 10): Observable<ApiResponse<PageResponse<Blog>>> {
    return this.http.get<ApiResponse<PageResponse<Blog>>>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  getBlogBySlug(slug: string): Observable<ApiResponse<Blog>> {
    return this.http.get<ApiResponse<Blog>>(
      `${this.apiUrl}/${slug}`
    );
  }

  searchBlogs(keyword: string, page = 0, size = 10): Observable<ApiResponse<PageResponse<Blog>>> {
    return this.http.get<ApiResponse<PageResponse<Blog>>>(
      `${this.apiUrl}/search?q=${keyword}&page=${page}&size=${size}`
    );
  }

  getRelatedBlogs(slug: string): Observable<ApiResponse<Blog[]>> {
    return this.http.get<ApiResponse<Blog[]>>(
      `${this.apiUrl}/${slug}/related`
    );
  }
}