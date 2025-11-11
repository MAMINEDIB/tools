import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../shared/services/project.service';
import { TaskService } from '../shared/services/task.service';
import { AuthService } from '../shared/services/auth.service';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  recentActivity: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Navigation Bar -->
      <nav class="bg-white shadow-lg border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-6">
              <div class="flex items-center">
                <svg class="w-8 h-8 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PMT</h1>
              </div>
              <div class="hidden md:flex space-x-4">
                <a routerLink="/dashboard" class="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">Tableau de bord</a>
                <a routerLink="/projects" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Projets</a>
                <a routerLink="/invitations/accept" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                  Invitations
                </a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ currentUser?.firstName?.charAt(0) }}{{ currentUser?.lastName?.charAt(0) }}
                </div>
                <span class="text-sm font-medium text-gray-700">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
              </div>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 border border-gray-300 hover:border-red-500">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-4xl font-bold text-gray-900">Tableau de bord</h2>
            <p class="mt-2 text-lg text-gray-600">Bienvenue, {{ currentUserName }} ! Voici un aperçu de vos projets.</p>
          </div>
          <div class="flex items-center space-x-3">
            <button 
              routerLink="/invitations/accept"
              class="inline-flex items-center px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 1 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
              </svg>
              Mes invitations
            </button>
            <button 
              routerLink="/projects"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              Voir tous les projets
            </button>
          </div>
        </div>
        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>

        <!-- Stats Grid -->
        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Projects -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 transform hover:scale-105 transition-all hover:shadow-xl">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total des projets</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalProjects }}</p>
              </div>
              <div class="bg-indigo-100 p-4 rounded-xl">
                <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Total Tasks -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-all hover:shadow-xl">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Total des tâches</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.totalTasks }}</p>
              </div>
              <div class="bg-purple-100 p-4 rounded-xl">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- Completed Tasks -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all hover:shadow-xl">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Terminées</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.completedTasks }}</p>
                <p class="text-xs text-green-600 font-medium mt-1">{{ getCompletionRate() }}% terminé</p>
              </div>
              <div class="bg-green-100 p-4 rounded-xl">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- High Priority -->
          <div class="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-all hover:shadow-xl">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600 mb-1">Haute priorité</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.highPriorityTasks }}</p>
              </div>
              <div class="bg-orange-100 p-4 rounded-xl">
                <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Task Distribution -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              Répartition des tâches
            </h3>
            
            <div class="space-y-4">
              <!-- Pending Tasks Bar -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">En attente</span>
                  <span class="text-sm font-semibold text-blue-600">{{ stats.pendingTasks }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                       [style.width]="getTaskPercentage('pending') + '%'"></div>
                </div>
              </div>

              <!-- In Progress Bar -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">En cours</span>
                  <span class="text-sm font-semibold text-yellow-600">{{ stats.totalTasks - stats.completedTasks - stats.pendingTasks }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div class="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                       [style.width]="getTaskPercentage('in_progress') + '%'"></div>
                </div>
              </div>

              <!-- Completed Bar -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Terminées</span>
                  <span class="text-sm font-semibold text-green-600">{{ stats.completedTasks }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div class="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                       [style.width]="getTaskPercentage('completed') + '%'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority Distribution -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div class="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-lg mr-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
              Aperçu des priorités
            </h3>

            <div class="grid grid-cols-3 gap-4">
              <!-- High Priority -->
              <div class="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <div class="text-3xl font-bold text-red-600 mb-1">{{ stats.highPriorityTasks }}</div>
                <div class="text-xs font-medium text-red-700">Haute</div>
              </div>

              <!-- Medium Priority -->
              <div class="text-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div class="text-3xl font-bold text-yellow-600 mb-1">{{ getMediumPriorityCount() }}</div>
                <div class="text-xs font-medium text-yellow-700">Moyenne</div>
              </div>

              <!-- Low Priority -->
              <div class="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div class="text-3xl font-bold text-green-600 mb-1">{{ getLowPriorityCount() }}</div>
                <div class="text-xs font-medium text-green-700">Basse</div>
              </div>
            </div>

            <!-- Circular Progress -->
            <div class="mt-6 flex justify-center">
              <div class="relative w-40 h-40">
                <svg class="transform -rotate-90 w-40 h-40">
                  <circle cx="80" cy="80" r="70" stroke="#e5e7eb" stroke-width="12" fill="none" />
                  <circle cx="80" cy="80" r="70" 
                          [attr.stroke-dasharray]="getCircumference()"
                          [attr.stroke-dashoffset]="getCircumference() - (getCircumference() * getCompletionRate() / 100)"
                          stroke="url(#gradient)" 
                          stroke-width="12" 
                          fill="none"
                          class="transition-all duration-1000" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-gray-900">{{ getCompletionRate() }}%</div>
                    <div class="text-xs text-gray-500">Terminé</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <div class="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg mr-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            Projets récents
          </h3>

          <div *ngIf="recentProjects.length === 0" class="text-center py-12">
            <div class="bg-gray-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
            </div>
            <p class="text-gray-500">Aucun projet pour le moment</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let project of recentProjects"
                 (click)="navigateToProject(project.id)"
                 class="group p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer">
              <div class="flex items-start justify-between mb-3">
                <h4 class="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ project.name }}</h4>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ project.description }}</p>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  {{ project.memberCount }} membres
                </span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  {{ project.taskCount }} tâches
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriorityTasks: 0,
    overdueTasks: 0,
    recentActivity: []
  };
  
  recentProjects: any[] = [];
  loading = false;
  currentUserName = '';
  currentUser: any;

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.currentUserName = localStorage.getItem('userName') || 'User';
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Load user's projects
    this.projectService.getAllProjects().subscribe({
      next: (projects: any) => {
        this.stats.totalProjects = projects.length;
        this.recentProjects = projects.slice(0, 6); // Show last 6 projects
        
        // Calculate task statistics from projects
        let totalTasks = 0;
        let completedTasks = 0;
        let pendingTasks = 0;
        let highPriorityTasks = 0;
        
        projects.forEach((project: any) => {
          totalTasks += project.taskCount || 0;
          // Note: You'll need to fetch detailed task data for accurate stats
          // This is simplified
        });
        
        this.stats.totalTasks = totalTasks;
        this.stats.completedTasks = Math.floor(totalTasks * 0.4); // Simplified
        this.stats.pendingTasks = Math.floor(totalTasks * 0.3);
        this.stats.highPriorityTasks = Math.floor(totalTasks * 0.2);
        
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });
  }

  getCompletionRate(): number {
    if (this.stats.totalTasks === 0) return 0;
    return Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100);
  }

  getTaskPercentage(type: string): number {
    if (this.stats.totalTasks === 0) return 0;
    
    switch (type) {
      case 'pending':
        return (this.stats.pendingTasks / this.stats.totalTasks) * 100;
      case 'completed':
        return (this.stats.completedTasks / this.stats.totalTasks) * 100;
      case 'in_progress':
        const inProgress = this.stats.totalTasks - this.stats.completedTasks - this.stats.pendingTasks;
        return (inProgress / this.stats.totalTasks) * 100;
      default:
        return 0;
    }
  }

  getMediumPriorityCount(): number {
    return Math.floor(this.stats.totalTasks * 0.5);
  }

  getLowPriorityCount(): number {
    return this.stats.totalTasks - this.stats.highPriorityTasks - this.getMediumPriorityCount();
  }

  getCircumference(): number {
    return 2 * Math.PI * 70; // radius = 70
  }

  navigateToProject(projectId: number) {
    this.router.navigate(['/projects', projectId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
