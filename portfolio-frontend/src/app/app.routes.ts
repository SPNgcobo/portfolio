import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './auth/pages/login/login.component';
import { RegisterComponent } from './auth/pages/register/register.component';
import { ForgotPasswordComponent } from './auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
//   { path: 'projects', loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent) },
//   { path: 'projects/:id', loadComponent: () => import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent) },
//   { path: 'blogs', loadComponent: () => import('./pages/blogs/blogs.component').then(m => m.BlogsComponent) },
//   { path: 'blogs/:slug', loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },
//   { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
//   { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
//   { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent) },
  
//   { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  
  { path: '**', redirectTo: '' }
];