import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Blog } from '../../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class AdminBlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/blogs`;
  private blogsApiUrl = `${environment.apiUrl}/blogs`;


  getBlogs(): Observable<ApiResponse<Blog[]>> {
    return this.http.get<ApiResponse<Blog[]>>(
      `${this.apiUrl}/admin/blogs`,
      { withCredentials: true }
    );
  }

  getBlog(id: string): Observable<ApiResponse<Blog>> {
    return this.http.get<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs/${id}`,
      { withCredentials: true }
    );
  }

  createBlog(blog: Partial<Blog>): Observable<ApiResponse<Blog>> {
    return this.http.post<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs`,
      blog,
      { withCredentials: true }
    );
  }

  updateBlog(id: string, blog: Partial<Blog>): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs/${id}`,
      blog,
      { withCredentials: true }
    );
  }

  deleteBlog(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/admin/blogs/${id}`,
      { withCredentials: true }
    );
  }

  publishBlog(id: string): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs/${id}/publish`,
      {},
      { withCredentials: true }
    );
  }

  unpublishBlog(id: string): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs/${id}/unpublish`,
      {},
      { withCredentials: true }
    );
  }

  featureBlog(id: string): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs/${id}/feature`,
      {},
      { withCredentials: true }
    );
  }

  unfeatureBlog(id: string): Observable<ApiResponse<Blog>> {
    return this.http.put<ApiResponse<Blog>>(
      `${this.apiUrl}/admin/blogs/${id}/unfeature`,
      {},
      { withCredentials: true }
    );
  }
}