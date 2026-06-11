import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats } from '../models/dashboard-stats';
import { DashboardOverview } from '../models/dashboard-overview';
import { AnalyticsChartResponse } from '../models/analytics-chart';
import type { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(
      `${this.apiUrl}/stats`,
      { withCredentials: true }
    );
  }

  getOverview(): Observable<ApiResponse<DashboardOverview>> {
    return this.http.get<ApiResponse<DashboardOverview>>(
      `${this.apiUrl}/overview`,
      { withCredentials: true }
    );
  }

  getCharts(): Observable<ApiResponse<AnalyticsChartResponse>> {
    return this.http.get<ApiResponse<AnalyticsChartResponse>>(
      `${this.apiUrl}/charts`,
      { withCredentials: true }
    );
  }
}