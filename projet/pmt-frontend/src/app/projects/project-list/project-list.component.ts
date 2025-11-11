import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../shared/services/project.service';
import { AuthService } from '../../shared/services/auth.service';
import { InvitationService } from '../../shared/services/invitation.service';
import { Project } from '../../shared/models/project.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, ModalComponent],
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
                <a routerLink="/dashboard" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">Tableau de bord</a>
                <a routerLink="/projects" class="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">Projets</a>
                <button (click)="showInvitationsModal()" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors relative">
                  Invitations
                  <span *ngIf="pendingInvitationsCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{ pendingInvitationsCount }}
                  </span>
                </button>
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
            <h2 class="text-4xl font-bold text-gray-900">Mes projets</h2>
            <p class="mt-2 text-lg text-gray-600">Gérez vos projets et collaborez avec votre équipe</p>
          </div>
          <button
            (click)="openCreateProjectModal()"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nouveau projet
          </button>
        </div>

        <!-- Search and Filter Bar -->
        <div class="mb-6 bg-white rounded-xl shadow-md p-4">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Search Input -->
            <div class="flex-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterProjects()"
                placeholder="Rechercher des projets par nom ou description..."
                class="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
            </div>

            <!-- Sort Dropdown -->
            <select
              [(ngModel)]="sortBy"
              (ngModelChange)="filterProjects()"
              class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              <option value="name">Trier par nom</option>
              <option value="date">Trier par date</option>
              <option value="tasks">Trier par tâches</option>
              <option value="members">Trier par membres</option>
            </select>

            <!-- Clear Filters -->
            <button
              *ngIf="searchQuery"
              (click)="clearFilters()"
              class="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Effacer
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <!-- No Results -->
        <div *ngIf="!loading && filteredProjects.length === 0 && searchQuery" class="text-center py-12">
          <div class="bg-gray-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-1">Aucun projet trouvé</h3>
          <p class="text-sm text-gray-500">Essayez d'ajuster votre recherche ou vos filtres</p>
        </div>

        <!-- Projects Grid -->
        <div *ngIf="!loading && filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            *ngFor="let project of filteredProjects"
            class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-400 overflow-hidden group transform hover:-translate-y-1">
            <div class="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <div class="p-6" (click)="openProject(project.id)">
              <div class="flex items-start justify-between cursor-pointer">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {{ project.name }}
                  </h3>
                  <p class="mt-2 text-sm text-gray-600 line-clamp-2">
                    {{ project.description || 'Aucune description fournie' }}
                  </p>
                </div>
                <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>

              <div class="mt-6 flex items-center justify-between">
                <div class="flex space-x-4 text-sm">
                  <div class="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                    {{ project.taskCount }}
                  </div>
                  <div class="flex items-center text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    {{ project.memberCount }}
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t border-gray-200">
              <p class="text-xs text-gray-600 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Créé {{ project.createdAt | date:'medium' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && projects.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-6">
            <svg class="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Aucun projet pour le moment</h3>
          <p class="text-lg text-gray-600 mb-8">Commencez par créer votre premier projet et invitez votre équipe</p>
          <button
            (click)="openCreateProjectModal()"
            class="inline-flex items-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Créer votre premier projet
          </button>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <app-modal
      [isOpen]="showCreateModal"
      [title]="'Créer un nouveau projet'"
      [icon]="'info'"
      [confirmText]="'Créer le projet'"
      [confirmDisabled]="projectForm.invalid || creating"
      (close)="closeCreateModal()"
      (confirmed)="submitProject()">
      <form [formGroup]="projectForm" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Nom du projet <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            formControlName="name"
            placeholder="Entrez le nom du projet"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <p *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" 
             class="mt-1 text-sm text-red-600">
            Le nom du projet est requis
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            formControlName="description"
            rows="4"
            placeholder="Décrivez votre projet (optionnel)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Date de début
          </label>
          <input
            type="date"
            formControlName="startDate"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <p *ngIf="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </app-modal>

    <!-- Invitations Modal -->
    <app-modal
      [isOpen]="showInvitations"
      [title]="'Invitations en attente'"
      [icon]="'info'"
      [showConfirm]="false"
      [cancelText]="'Fermer'"
      (close)="closeInvitationsModal()">
      <div class="space-y-4">
        <div *ngIf="loadingInvitations" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <div *ngIf="!loadingInvitations && pendingInvitations.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path>
          </svg>
          <p class="text-gray-500">Aucune invitation en attente</p>
        </div>

        <div *ngFor="let invitation of pendingInvitations" 
             class="border border-gray-200 rounded-xl p-4 hover:border-indigo-400 transition-all">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900 text-lg">{{ invitation.project.name }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ invitation.project.description || 'Aucune description' }}</p>
            </div>
            <span class="px-3 py-1 rounded-lg text-xs font-semibold"
                  [ngClass]="{
                    'bg-red-100 text-red-800': invitation.role === 'ADMIN',
                    'bg-blue-100 text-blue-800': invitation.role === 'MEMBER',
                    'bg-green-100 text-green-800': invitation.role === 'OBSERVER'
                  }">
              {{ invitation.role }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>Invité par : <strong>{{ invitation.invitedBy.firstName }} {{ invitation.invitedBy.lastName }}</strong></span>
            <span>Expire : {{ invitation.expiresAt | date:'short' }}</span>
          </div>

          <div class="flex space-x-2">
            <button
              (click)="acceptInvitation(invitation.id)"
              [disabled]="acceptingInvitation === invitation.id"
              class="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50">
              <span *ngIf="acceptingInvitation !== invitation.id">Accepter</span>
              <span *ngIf="acceptingInvitation === invitation.id">Acceptation...</span>
            </button>
            <button
              (click)="rejectInvitation(invitation.id)"
              [disabled]="rejectingInvitation === invitation.id"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all disabled:opacity-50">
              <span *ngIf="rejectingInvitation !== invitation.id">Refuser</span>
              <span *ngIf="rejectingInvitation === invitation.id">Refus...</span>
            </button>
          </div>
        </div>
      </div>
    </app-modal>
  `
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = true;
  currentUser: any;
  showCreateModal = false;
  showInvitations = false;
  projectForm: FormGroup;
  creating = false;
  error = '';
  pendingInvitationsCount = 0;
  pendingInvitations: any[] = [];
  loadingInvitations = false;
  acceptingInvitation: number | null = null;
  rejectingInvitation: number | null = null;
  
  // Search and Filter
  searchQuery = '';
  sortBy = 'date';

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      startDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadPendingInvitations();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects];
        this.filterProjects();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterProjects(): void {
    let filtered = [...this.projects];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        (project.description && project.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        filtered.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'tasks':
        filtered.sort((a, b) => (b.taskCount || 0) - (a.taskCount || 0));
        break;
      case 'members':
        filtered.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
        break;
    }

    this.filteredProjects = filtered;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterProjects();
  }

  loadPendingInvitations(): void {
    if (this.currentUser?.email) {
      this.invitationService.getPendingInvitations(this.currentUser.email).subscribe({
        next: (invitations) => {
          this.pendingInvitations = invitations;
          this.pendingInvitationsCount = invitations.length;
        }
      });
    }
  }

  openProject(id: number): void {
    this.router.navigate(['/projects', id]);
  }

  openCreateProjectModal(): void {
    this.showCreateModal = true;
    this.projectForm.reset();
    this.error = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitProject(): void {
    if (this.projectForm.valid && !this.creating) {
      this.creating = true;
      this.error = '';

      this.projectService.createProject(this.projectForm.value).subscribe({
        next: (project) => {
          this.creating = false;
          this.closeCreateModal();
          this.router.navigate(['/projects', project.id]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create project';
          this.creating = false;
        }
      });
    }
  }

  showInvitationsModal(): void {
    this.showInvitations = true;
    this.loadingInvitations = true;
    this.loadPendingInvitations();
    this.loadingInvitations = false;
  }

  closeInvitationsModal(): void {
    this.showInvitations = false;
  }

  acceptInvitation(invitationId: number): void {
    this.acceptingInvitation = invitationId;
    this.invitationService.acceptInvitation(invitationId.toString()).subscribe({
      next: () => {
        this.acceptingInvitation = null;
        this.loadPendingInvitations();
        this.loadProjects();
      },
      error: (err) => {
        console.error('Error accepting invitation:', err);
        this.acceptingInvitation = null;
        alert('Failed to accept invitation: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  rejectInvitation(invitationId: number): void {
    this.rejectingInvitation = invitationId;
    this.invitationService.rejectInvitation(invitationId.toString()).subscribe({
      next: () => {
        this.rejectingInvitation = null;
        this.loadPendingInvitations();
      },
      error: (err) => {
        console.error('Error rejecting invitation:', err);
        this.rejectingInvitation = null;
        alert('Failed to reject invitation: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
