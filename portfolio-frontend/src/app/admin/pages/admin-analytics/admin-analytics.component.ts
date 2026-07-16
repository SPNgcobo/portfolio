import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { NotificationService } from '../../../shared/services/notification.service';
import {

  AnalyticsChartResponse,
  AnalyticsChartPoint
} from '../../models/analytics-chart';
import type { DashboardStats } from '../../models/dashboard-stats';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminDashboardService);
  private notificationService = inject(NotificationService);

  stats: DashboardStats | null = null;
  charts: AnalyticsChartResponse | null = null;

  loading = true;
  autoRefresh = true;
  selectedPeriod: '7d' | '30d' | '90d' | 'all' = 'all';
  selectedChart: 'views' | 'likes' | 'github' | 'demo' = 'views';

  private refreshInterval: any;

  ngOnInit(): void {
    this.loadData();

    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh) {
        this.loadDataSilently();
      }
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadData(): void {
    this.loading = true;
    this.loadStats();
    this.loadCharts();
  }

  private loadDataSilently(): void {
    this.loadStats();
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

  private loadCharts(): void {
    this.adminService.getCharts().subscribe({
      next: (res) => {
        this.charts = res.data;
      },
      error: (err) => {
        console.error('Failed to load charts:', err);
      }
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

  getChartData(): AnalyticsChartPoint[] {
    if (!this.charts) return [];
    switch (this.selectedChart) {
      case 'views': return this.charts.topViewedProjects || [];
      case 'likes': return this.charts.topLikedProjects || [];
      case 'github': return this.charts.topGithubProjects || [];
      case 'demo': return this.charts.topDemoProjects || [];
      default: return [];
    }
  }

  getChartLabel(): string {
    switch (this.selectedChart) {
      case 'views': return '👁️ Most Viewed Projects';
      case 'likes': return '❤️ Most Liked Projects';
      case 'github': return '🐙 Most GitHub Clicked';
      case 'demo': return '🚀 Most Demo Clicked';
      default: return 'Analytics';
    }
  }

  getChartColor(): string {
    switch (this.selectedChart) {
      case 'views': return '#3b82f6';
      case 'likes': return '#ef4444';
      case 'github': return '#24292e';
      case 'demo': return '#10b981';
      default: return '#6366f1';
    }
  }


  getTotalProjects(): number {
    return this.stats?.totalProjects || 0;
  }

  getTotalViews(): string {
    return this.formatNumber(this.stats?.totalProjectViews || 0);
  }

  getTotalLikes(): string {
    return this.formatNumber(this.stats?.totalProjectLikes || 0);
  }

  getTotalComments(): string {
    return this.formatNumber(this.stats?.totalComments || 0);
  }

  getTotalVisitors(): string {
    return this.formatNumber(this.stats?.totalVisitors || 0);
  }

  getTotalGithubClicks(): string {
    return this.formatNumber(this.stats?.totalGithubClicks || 0);
  }

  getTotalDemoClicks(): string {
    return this.formatNumber(this.stats?.totalDemoClicks || 0);
  }

  getTotalDetailClicks(): string {
    return this.formatNumber(this.stats?.totalDetailClicks || 0);
  }

  getPublishedBlogs(): number {
    return this.stats?.publishedBlogs || 0;
  }

  getFeaturedProjects(): number {
    return this.stats?.featuredProjects || 0;
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  getEngagementRate(): number {
    const views = this.stats?.totalProjectViews || 0;
    const likes = this.stats?.totalProjectLikes || 0;
    if (views === 0) return 0;
    return Math.round((likes / views) * 100);
  }

  getClickThroughRate(): number {
    const views = this.stats?.totalProjectViews || 0;
    const clicks = (this.stats?.totalGithubClicks || 0) + (this.stats?.totalDemoClicks || 0);
    if (views === 0) return 0;
    return Math.round((clicks / views) * 100);
  }

  getAverageViewsPerProject(): number {
    const projects = this.stats?.totalProjects || 0;
    const views = this.stats?.totalProjectViews || 0;
    if (projects === 0) return 0;
    return Math.round(views / projects);
  }

  getAverageLikesPerProject(): number {
    const projects = this.stats?.totalProjects || 0;
    const likes = this.stats?.totalProjectLikes || 0;
    if (projects === 0) return 0;
    return Math.round(likes / projects);
  }

  getStatsItems(): { label: string; value: string; icon: string; color: string }[] {
    return [
      { label: 'Total Projects', value: this.getTotalProjects().toString(), icon: '📁', color: 'blue' },
      { label: 'Total Views', value: this.getTotalViews(), icon: '👁️', color: 'indigo' },
      { label: 'Total Likes', value: this.getTotalLikes(), icon: '❤️', color: 'red' },
      { label: 'Total Comments', value: this.getTotalComments(), icon: '💬', color: 'green' },
      { label: 'Total Visitors', value: this.getTotalVisitors(), icon: '👥', color: 'purple' },
      { label: 'GitHub Clicks', value: this.getTotalGithubClicks(), icon: '🐙', color: 'gray' },
      { label: 'Demo Clicks', value: this.getTotalDemoClicks(), icon: '🚀', color: 'teal' },
      { label: 'Detail Clicks', value: this.getTotalDetailClicks(), icon: '📄', color: 'amber' }
    ];
  }


  refreshData(): void {
    this.loadData();
    this.notificationService.success('Analytics refreshed');
  }

  exportData(): void {
    const data = {
      stats: this.stats,
      charts: this.charts,
      exportedAt: new Date().toISOString(),
      summary: {
        totalProjects: this.getTotalProjects(),
        totalViews: this.getTotalViews(),
        totalLikes: this.getTotalLikes(),
        totalComments: this.getTotalComments(),
        totalVisitors: this.getTotalVisitors(),
        engagementRate: this.getEngagementRate() + '%',
        clickThroughRate: this.getClickThroughRate() + '%',
        averageViewsPerProject: this.getAverageViewsPerProject(),
        averageLikesPerProject: this.getAverageLikesPerProject()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.notificationService.success('Analytics exported successfully');
  }

  changePeriod(period: '7d' | '30d' | '90d' | 'all'): void {
    this.selectedPeriod = period;
    this.notificationService.info(`Viewing ${period === 'all' ? 'all' : period} data`);
  }

  changeChart(type: 'views' | 'likes' | 'github' | 'demo'): void {
    this.selectedChart = type;
  }

  trackByFn(index: number, item: any): string {
    return item.id || index.toString();
  }
}