import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { DashboardStats } from '../../models/dashboard-stats';
import { DashboardOverview } from '../../models/dashboard-overview';
import { AnalyticsChartResponse, AnalyticsChartPoint } from '../../models/analytics-chart';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminDashboardService);

  stats?: DashboardStats;
  overview?: DashboardOverview;
  charts?: AnalyticsChartResponse;

  loading = true;
  refreshInterval: any;

  ngOnInit(): void {
    this.loadAllData();

    this.refreshInterval = setInterval(() => {
      this.loadStats();
      this.loadCharts();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAllData(): void {
    this.loadStats();
    this.loadOverview();
    this.loadCharts();
  }

  private loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
        this.loading = false;
      }
    });
  }

  private loadOverview(): void {
    this.adminService.getOverview().subscribe({
      next: (res) => {
        this.overview = res.data;
      },
      error: (err) => console.error('Failed to load overview:', err)
    });
  }

  private loadCharts(): void {
    this.adminService.getCharts().subscribe({
      next: (res) => {
        this.charts = res.data;
      },
      error: (err) => console.error('Failed to load charts:', err)
    });
  }

  getMaxChartValue(points: AnalyticsChartPoint[] | undefined): number {
    if (!points || points.length === 0) return 100;
    const max = Math.max(...points.map(p => p.value));
    return max === 0 ? 100 : max;
  }

  getBarWidth(value: number, max: number): string {
    return `${(value / max) * 100}%`;
  }
}