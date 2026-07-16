export interface AnalyticsDashboardResponse {
    totalProjects: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalGithubClicks: number;
    totalDemoClicks: number;
    totalDetailClicks: number;
    totalVisitors: number;
}

export interface AnalyticsChartPoint {
    label: string;
    value: number;
}

export interface AnalyticsChartResponse {
    topViewedProjects: AnalyticsChartPoint[];
    topLikedProjects: AnalyticsChartPoint[];
    topGithubProjects: AnalyticsChartPoint[];
    topDemoProjects: AnalyticsChartPoint[];
}

export interface AnalyticsSummary {
    totalProjects: number;
    totalBlogs: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalVisitors: number;
    totalEngagements: number;
    averageViewsPerProject: number;
    averageLikesPerProject: number;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
}