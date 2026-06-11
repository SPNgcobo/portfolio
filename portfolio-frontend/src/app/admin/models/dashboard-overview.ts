import type { Blog } from '../../models/blog.model';
import type { Project } from '../../models/project.model';
import type { DashboardStats } from './dashboard-stats';

export interface DashboardOverview {
    stats: DashboardStats;
    recentProjects: Project[];
    recentBlogs: Blog[];
}