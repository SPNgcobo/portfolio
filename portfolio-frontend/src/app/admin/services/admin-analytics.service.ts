import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import {
  AnalyticsDashboardResponse,
  AnalyticsChartResponse
} from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  getStats(): Observable<ApiResponse<AnalyticsDashboardResponse>> {
    return this.http.get<ApiResponse<AnalyticsDashboardResponse>>(
      `${this.apiUrl}/stats`,
      { withCredentials: true }
    );
  }

  getCharts(): Observable<ApiResponse<AnalyticsChartResponse>> {
    return this.http.get<ApiResponse<AnalyticsChartResponse>>(
      `${this.apiUrl}/charts`,
      { withCredentials: true }
    );
  }

  getOverview(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/overview`,
      { withCredentials: true }
    );
  }
}