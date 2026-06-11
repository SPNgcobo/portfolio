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