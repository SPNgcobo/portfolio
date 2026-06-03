import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { LoginComponent } from './auth/pages/login/login.component';

import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';

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
    path: 'projects/:id',
    component: ProjectDetailComponent
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
