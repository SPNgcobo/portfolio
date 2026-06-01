import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${slug}`);
  }

  search(keyword: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?q=${keyword}`);
  }
}