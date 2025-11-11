import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./projects/project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'projects/new',
    canActivate: [authGuard],
    loadComponent: () => import('./projects/project-create/project-create.component').then(m => m.ProjectCreateComponent)
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./projects/project-detail-new/project-detail-new.component').then(m => m.ProjectDetailNewComponent)
  },
  {
    path: 'invitations/accept',
    canActivate: [authGuard],
    loadComponent: () => import('./invitations/accept-invitation/accept-invitation.component').then(m => m.AcceptInvitationComponent)
  },
  {
    path: 'tasks/new',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: 'tasks/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/task-detail/task-detail.component').then(m => m.TaskDetailComponent)
  },
  {
    path: 'tasks/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  { path: '**', redirectTo: '/login' }
];
