import { Injectable } from '@angular/core';

import { HttpClient }
from '@angular/common/http';

import { Observable }
from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private baseUrl =
    'http://localhost:8080/api/blogs';

  constructor(
    private http: HttpClient
  ) {}

  getAll(): Observable<any> {

    return this.http.get(
      this.baseUrl
    );
  }

  getBySlug(
    slug: string
  ): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/${slug}`
    );
  }

  search(
    keyword: string
  ): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/search?q=${keyword}`
    );
  }
}