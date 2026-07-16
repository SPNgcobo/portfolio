import type { Project } from './project.model';
import type { Blog } from './blog.model';
import type { PaginationResponse } from './pagination-response.model';

export interface GlobalSearchResponse {
    projects: PaginationResponse<Project>;
    blogs: PaginationResponse<Blog>;
}

export type { PaginationResponse };