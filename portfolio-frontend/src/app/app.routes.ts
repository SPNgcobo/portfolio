import { Routes } from '@angular/router';

import { HomeComponent }
    from './pages/home/home.component';

import { ProjectsComponent }
    from './pages/projects/projects.component';

import { LoginComponent }
    from './auth/pages/login/login.component';

import { AuthGuard }
    from './auth/guards/auth.guard';

export const routes: Routes = [

    {
        path: '',
        component: HomeComponent
    },

    {
        path: 'projects',
        component: ProjectsComponent
    },

    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: '**',
        redirectTo: ''
    }
];