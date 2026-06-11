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
    }
];