import { Routes } from '@angular/router';
import { AdminGuard } from '../auth/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
    },
    {
        path: 'projects',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-projects/admin-projects.component')
            .then(m => m.AdminProjectsComponent)
    },
    {
        path: 'projects/new',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-project-form/admin-project-form.component')
            .then(m => m.AdminProjectFormComponent)
    },
    {
        path: 'projects/edit/:id',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-project-form/admin-project-form.component')
            .then(m => m.AdminProjectFormComponent)
    },
    {
        path: 'blogs',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-blogs/admin-blogs.component')
            .then(m => m.AdminBlogsComponent)
    },
    {
        path: 'blogs/new',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-blog-form/admin-blog-form.component')
            .then(m => m.AdminBlogFormComponent)
    },
    {
        path: 'blogs/edit/:id',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-blog-form/admin-blog-form.component')
            .then(m => m.AdminBlogFormComponent)
    },
    {
        path: 'comments',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-comments/admin-comments.component')
            .then(m => m.AdminCommentsComponent)
    },
    {
        path: 'skills',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-skills/admin-skills.component')
            .then(m => m.AdminSkillsComponent)
    },
    {
        path: 'tools',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-tools/admin-tools.component')
            .then(m => m.AdminToolsComponent)
    },
    {
        path: 'media',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-media/admin-media.component')
            .then(m => m.AdminMediaComponent)
    },
    {
        path: 'notifications',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin-notifications/admin-notifications.component')
            .then(m => m.AdminNotificationsComponent)
    }
];