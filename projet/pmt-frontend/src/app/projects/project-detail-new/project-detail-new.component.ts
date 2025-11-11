import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../shared/services/project.service';
import { TaskService } from '../../shared/services/task.service';
import { InvitationService } from '../../shared/services/invitation.service';
import { AuthService } from '../../shared/services/auth.service';
import { Project, ProjectMember, Role } from '../../shared/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../shared/models/task.model';
import { Invitation, Role as InvitationRole } from '../../shared/models/invitation.model';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-project-detail-new',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule, ReactiveFormsModule, FormsModule, ModalComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Top Navigation -->
      <nav class="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button (click)="goToDashboard()" class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Go to Dashboard">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </button>
              <button (click)="goBack()" class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Back to Projects">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ project?.name }}</h1>
                <p class="text-sm text-gray-500 mt-0.5">{{ project?.description }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <button
                (click)="showMembersModal = true"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Members ({{ members.length }})
              </button>
              <button
                (click)="openTaskModal()"
                class="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all transform hover:scale-105">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Kanban Board -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Board Statistics & Filters -->
        <div class="mb-6 space-y-4">
          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 font-medium">Total des tâches</p>
                  <p class="text-3xl font-bold text-gray-900 mt-1">{{ taskStats.total }}</p>
                </div>
                <div class="p-3 bg-indigo-100 rounded-lg">
                  <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 font-medium">Terminées</p>
                  <p class="text-3xl font-bold text-gray-900 mt-1">{{ taskStats.completed }}</p>
                </div>
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 font-medium">Taux de complétion</p>
                  <p class="text-3xl font-bold text-gray-900 mt-1">{{ taskStats.completionRate }}%</p>
                </div>
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 font-medium">En retard</p>
                  <p class="text-3xl font-bold text-gray-900 mt-1">{{ taskStats.overdue }}</p>
                </div>
                <div class="p-3 bg-red-100 rounded-lg">
                  <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Search and Filters Bar -->
          <div class="bg-white rounded-xl shadow-md p-4">
            <div class="flex items-center space-x-3">
              <!-- Search Input -->
              <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilters()"
                  placeholder="Rechercher des tâches par titre, description ou assigné..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <!-- Filter Toggle Button -->
              <button
                (click)="showFilters = !showFilters"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center space-x-2"
                [class.bg-indigo-50]="showFilters"
                [class.border-indigo-500]="showFilters">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
                <span class="font-medium">Filtres</span>
                <span *ngIf="activeFiltersCount > 0" class="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                  {{ activeFiltersCount }}
                </span>
              </button>

              <!-- Clear Filters -->
              <button
                *ngIf="activeFiltersCount > 0"
                (click)="clearFilters()"
                class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <span class="font-medium">Effacer</span>
              </button>
            </div>

            <!-- Expanded Filters -->
            <div *ngIf="showFilters" class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Priority Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                <select
                  [(ngModel)]="selectedPriority"
                  (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Toutes les priorités</option>
                  <option value="HIGH">🔴 Haute</option>
                  <option value="MEDIUM">🟡 Moyenne</option>
                  <option value="LOW">🟢 Basse</option>
                </select>
              </div>

              <!-- Assignee Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
                <select
                  [(ngModel)]="selectedAssignee"
                  (ngModelChange)="applyFilters()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Tous les membres</option>
                  <option value="unassigned">Non assigné</option>
                  <option *ngFor="let member of members" [value]="member.user.id">
                    {{ member.user.firstName }} {{ member.user.lastName }}
                  </option>
                </select>
              </div>

              <!-- Overdue Filter -->
              <div class="flex items-end">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="showOverdueTasks"
                    (ngModelChange)="applyFilters()"
                    class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span class="text-sm font-medium text-gray-700">Afficher seulement les tâches en retard</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- TO DO Column -->
          <div class="bg-white rounded-xl shadow-lg p-5 border-t-4 border-gray-400">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold text-gray-900 flex items-center text-lg">
                <span class="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                À FAIRE
                <span class="ml-2 px-2 py-0.5 text-sm text-gray-600 bg-gray-100 rounded-full">{{ todoTasks.length }}</span>
              </h3>
              <!-- Sort Dropdown -->
              <div class="relative">
                <button
                  (click)="toggleSort('todo')"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  [class.bg-indigo-100]="columnSort.todo !== 'none'"
                  title="Sort tasks">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                  </svg>
                </button>
                <span *ngIf="columnSort.todo !== 'none'" class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full"></span>
              </div>
            </div>
            <div
              cdkDropList
              #todoList="cdkDropList"
              [cdkDropListData]="todoTasks"
              [cdkDropListConnectedTo]="[inProgressList, doneList]"
              (cdkDropListDropped)="drop($event)"
              class="space-y-3 min-h-[600px]">
              <div *ngFor="let task of todoTasks"
                   cdkDrag
                   (click)="viewTask(task)"
                   class="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-gray-400 group relative">
                <!-- Overdue Badge -->
                <div *ngIf="isTaskOverdue(task)" class="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  OVERDUE
                </div>
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-gray-900 flex-1 group-hover:text-indigo-600 transition-colors">{{ task.title }}</h4>
                  <span *ngIf="task.priority" [class]="getPriorityBadgeClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                    {{ task.priority }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description || 'No description' }}</p>
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {{ task.assignedTo?.firstName || 'Unassigned' }}
                  </div>
                  <div *ngIf="task.dueDate" class="flex items-center text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'short' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- IN PROGRESS Column -->
          <div class="bg-white rounded-xl shadow-lg p-5 border-t-4 border-blue-500">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold text-gray-900 flex items-center text-lg">
                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                EN COURS
                <span class="ml-2 px-2 py-0.5 text-sm text-blue-600 bg-blue-100 rounded-full">{{ inProgressTasks.length }}</span>
              </h3>
              <!-- Sort Dropdown -->
              <div class="relative">
                <button
                  (click)="toggleSort('inProgress')"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  [class.bg-indigo-100]="columnSort.inProgress !== 'none'"
                  title="Sort tasks">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                  </svg>
                </button>
                <span *ngIf="columnSort.inProgress !== 'none'" class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full"></span>
              </div>
            </div>
            <div
              cdkDropList
              #inProgressList="cdkDropList"
              [cdkDropListData]="inProgressTasks"
              [cdkDropListConnectedTo]="[todoList, doneList]"
              (cdkDropListDropped)="drop($event)"
              class="space-y-3 min-h-[600px]">
              <div *ngFor="let task of inProgressTasks"
                   cdkDrag
                   (click)="viewTask(task)"
                   class="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-blue-500 group relative">
                <!-- Overdue Badge -->
                <div *ngIf="isTaskOverdue(task)" class="absolute -top-2 -right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  OVERDUE
                </div>
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-gray-900 flex-1 group-hover:text-blue-600 transition-colors">{{ task.title }}</h4>
                  <span *ngIf="task.priority" [class]="getPriorityBadgeClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                    {{ task.priority }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description || 'No description' }}</p>
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {{ task.assignedTo?.firstName || 'Unassigned' }}
                  </div>
                  <div *ngIf="task.dueDate" class="flex items-center text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ task.dueDate | date:'short' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DONE Column -->
          <div class="bg-white rounded-xl shadow-lg p-5 border-t-4 border-green-500">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold text-gray-900 flex items-center text-lg">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                TERMINÉ
                <span class="ml-2 px-2 py-0.5 text-sm text-green-600 bg-green-100 rounded-full">{{ doneTasks.length }}</span>
              </h3>
              <!-- Sort Dropdown -->
              <div class="relative">
                <button
                  (click)="toggleSort('done')"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  [class.bg-indigo-100]="columnSort.done !== 'none'"
                  title="Sort tasks">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                  </svg>
                </button>
                <span *ngIf="columnSort.done !== 'none'" class="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full"></span>
              </div>
            </div>
            <div
              cdkDropList
              #doneList="cdkDropList"
              [cdkDropListData]="doneTasks"
              [cdkDropListConnectedTo]="[todoList, inProgressList]"
              (cdkDropListDropped)="drop($event)"
              class="space-y-3 min-h-[600px]">
              <div *ngFor="let task of doneTasks"
                   cdkDrag
                   (click)="viewTask(task)"
                   class="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-green-500 opacity-80 hover:opacity-100 group">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-gray-900 flex-1 line-through decoration-green-500 group-hover:text-green-600 transition-colors">{{ task.title }}</h4>
                  <span *ngIf="task.priority" [class]="getPriorityBadgeClass(task.priority)" class="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                    {{ task.priority }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description || 'No description' }}</p>
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center text-gray-500">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {{ task.assignedTo?.firstName || 'Unassigned' }}
                  </div>
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Members Modal -->
    <app-modal
      [isOpen]="showMembersModal"
      [title]="'Membres du projet'"
      [icon]="'info'"
      [showFooter]="false"
      (close)="showMembersModal = false">
      <div class="space-y-4">
        <!-- Header Actions -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-600">
            <span class="font-semibold">{{ members.length }}</span> membre{{ members.length !== 1 ? 's' : '' }}
            <span *ngIf="pendingInvitationsCount > 0" class="ml-2 text-orange-600">
              ({{ pendingInvitationsCount }} invitation{{ pendingInvitationsCount !== 1 ? 's' : '' }} en attente)
            </span>
          </div>
        </div>

        <!-- Invite Member Button -->
        <button
          *ngIf="canManageMembers"
          (click)="showInviteModal = true; showMembersModal = false"
          class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Inviter un nouveau membre
        </button>

        <!-- View Pending Invitations Button -->
        <button
          *ngIf="canManageMembers && pendingInvitationsCount > 0"
          (click)="showPendingInvitationsModal = true; showMembersModal = false"
          class="w-full flex items-center justify-center px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-100 transition-all">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Voir les invitations en attente ({{ pendingInvitationsCount }})
        </button>

        <!-- Members List -->
        <div class="space-y-2">
          <div *ngFor="let member of members" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center space-x-3 flex-1">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ member.user.firstName.charAt(0) }}{{ member.user.lastName.charAt(0) }}
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ member.user.firstName }} {{ member.user.lastName }}</p>
                <p class="text-sm text-gray-500">{{ member.user.email }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Role Badge/Dropdown -->
              <select
                *ngIf="canManageMembers && member.role !== 'OWNER'"
                [value]="member.role"
                (change)="changeRole(member.id, $event)"
                class="px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all"
                [class.bg-red-100]="member.role === 'ADMIN'"
                [class.text-red-800]="member.role === 'ADMIN'"
                [class.bg-blue-100]="member.role === 'MEMBER'"
                [class.text-blue-800]="member.role === 'MEMBER'"
                [class.bg-green-100]="member.role === 'OBSERVER'"
                [class.text-green-800]="member.role === 'OBSERVER'">
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
                <option value="OBSERVER">OBSERVER</option>
              </select>
              <span
                *ngIf="!canManageMembers || member.role === 'OWNER'"
                [class]="getRoleBadgeClass(member.role)"
                class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ member.role }}
              </span>
              <!-- Remove Member Button -->
              <button
                *ngIf="canManageMembers && member.role !== 'OWNER'"
                (click)="confirmRemoveMember(member)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove member">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-modal>

    <!-- Pending Invitations Modal -->
    <app-modal
      [isOpen]="showPendingInvitationsModal"
      [title]="'Pending Invitations'"
      [icon]="'info'"
      [showFooter]="false"
      (close)="closePendingInvitationsModal()">
      <div class="space-y-4">
        <div *ngIf="loadingInvitations" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>

        <div *ngIf="!loadingInvitations && projectInvitations.length === 0" class="text-center py-8">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-500">No pending invitations</p>
        </div>

        <div *ngFor="let invitation of projectInvitations" 
             class="border border-gray-200 rounded-xl p-4 hover:border-indigo-400 transition-all">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <p class="font-semibold text-gray-900">{{ invitation.recipientEmail }}</p>
                <span class="px-2 py-1 rounded-lg text-xs font-semibold"
                      [ngClass]="{
                        'bg-red-100 text-red-800': invitation.role === 'ADMIN',
                        'bg-blue-100 text-blue-800': invitation.role === 'MEMBER',
                        'bg-green-100 text-green-800': invitation.role === 'OBSERVER'
                      }">
                  {{ invitation.role }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Invited {{ getRelativeTime(invitation.createdAt) }}
              </p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              PENDING
            </span>
          </div>

          <div class="flex items-center justify-between text-sm mb-3">
            <span class="text-gray-600">Expires: {{ invitation.expiresAt | date:'short' }}</span>
          </div>

          <div class="flex space-x-2">
            <button
              (click)="resendInvitation(invitation.id)"
              [disabled]="resendingInvitation === invitation.id"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50">
              <span *ngIf="resendingInvitation !== invitation.id">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Resend
              </span>
              <span *ngIf="resendingInvitation === invitation.id">Sending...</span>
            </button>
            <button
              (click)="cancelInvitation(invitation.id)"
              [disabled]="cancelingInvitation === invitation.id"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all disabled:opacity-50">
              <span *ngIf="cancelingInvitation !== invitation.id">
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancel
              </span>
              <span *ngIf="cancelingInvitation === invitation.id">Canceling...</span>
            </button>
          </div>
        </div>

        <button
          (click)="showInviteModal = true; showPendingInvitationsModal = false"
          class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all mt-4">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Send New Invitation
        </button>
      </div>
    </app-modal>

    <!-- Confirm Remove Member Modal -->
    <app-modal
      [isOpen]="showRemoveMemberModal"
      [title]="'Remove Member'"
      [icon]="'warning'"
      [confirmText]="'Remove'"
      [cancelText]="'Cancel'"
      [confirmDisabled]="removingMember"
      (close)="closeRemoveMemberModal()"
      (confirmed)="removeMember()">
      <div *ngIf="memberToRemove" class="space-y-4">
        <p class="text-gray-700">
          Are you sure you want to remove <strong>{{ memberToRemove.user.firstName }} {{ memberToRemove.user.lastName }}</strong> from this project?
        </p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div class="text-sm text-yellow-800">
              <p class="font-medium">This action cannot be undone.</p>
              <p class="mt-1">The member will lose access to all project data and tasks.</p>
            </div>
          </div>
        </div>
      </div>
    </app-modal>

    <!-- Invite Member Modal -->
    <app-modal
      [isOpen]="showInviteModal"
      [title]="bulkInviteMode ? 'Invitation groupée' : 'Inviter un membre'"
      [icon]="'info'"
      [confirmText]="bulkInviteMode ? 'Envoyer toutes les invitations' : 'Envoyer l\\'invitation'"
      [confirmDisabled]="bulkInviteMode ? (bulkInviteEmails.length === 0 || inviting) : (inviteForm.invalid || inviting)"
      (close)="closeInviteModal()"
      (confirmed)="bulkInviteMode ? submitBulkInvitations() : submitInvitation()">
      <div class="space-y-4">
        <!-- Invite Mode Toggle -->
        <div class="flex items-center justify-center space-x-2 p-2 bg-gray-100 rounded-lg">
          <button
            (click)="bulkInviteMode = false"
            [class.bg-white]="!bulkInviteMode"
            [class.shadow-md]="!bulkInviteMode"
            [class.text-indigo-600]="!bulkInviteMode"
            class="flex-1 px-4 py-2 rounded-md font-medium transition-all">
            Invitation unique
          </button>
          <button
            (click)="bulkInviteMode = true"
            [class.bg-white]="bulkInviteMode"
            [class.shadow-md]="bulkInviteMode"
            [class.text-indigo-600]="bulkInviteMode"
            class="flex-1 px-4 py-2 rounded-md font-medium transition-all">
            Invitation groupée
          </button>
        </div>

        <!-- Single Invite Form -->
        <form *ngIf="!bulkInviteMode" [formGroup]="inviteForm" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Adresse e-mail <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              placeholder="membre@exemple.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p *ngIf="inviteForm.get('email')?.invalid && inviteForm.get('email')?.touched" 
               class="mt-1 text-sm text-red-600">
              Une adresse e-mail valide est requise
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Rôle <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="role"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="MEMBER">Membre - Peut créer et modifier des tâches</option>
              <option value="ADMIN">Admin - Accès complet au projet</option>
              <option value="OBSERVER">Observateur - Lecture seule</option>
            </select>
          </div>

          <!-- Role Permissions Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-semibold text-blue-900 mb-2 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Permissions du rôle
            </h4>
            <div class="space-y-2 text-sm text-blue-800">
              <div *ngIf="inviteForm.get('role')?.value === 'OBSERVER'">
                <p class="font-medium">L'observateur peut :</p>
                <ul class="list-disc list-inside ml-2 space-y-1">
                  <li>Voir toutes les tâches et détails du projet</li>
                  <li>Voir les membres de l'équipe</li>
                  <li>Ne peut rien créer, modifier ou supprimer</li>
                </ul>
              </div>
              <div *ngIf="inviteForm.get('role')?.value === 'MEMBER'">
                <p class="font-medium">Le membre peut :</p>
                <ul class="list-disc list-inside ml-2 space-y-1">
                  <li>Créer et modifier ses propres tâches</li>
                  <li>Mettre à jour le statut des tâches</li>
                  <li>Commenter les tâches</li>
                  <li>Voir toutes les données du projet</li>
                </ul>
              </div>
              <div *ngIf="inviteForm.get('role')?.value === 'ADMIN'">
                <p class="font-medium">L'admin peut :</p>
                <ul class="list-disc list-inside ml-2 space-y-1">
                  <li>Accès complet à toutes les tâches</li>
                  <li>Inviter et retirer des membres</li>
                  <li>Modifier les rôles des membres</li>
                  <li>Supprimer le projet</li>
                </ul>
              </div>
            </div>
          </div>

          <p *ngIf="inviteError" class="text-sm text-red-600">{{ inviteError }}</p>
          <p *ngIf="inviteSuccess" class="text-sm text-green-600">{{ inviteSuccess }}</p>
        </form>

        <!-- Bulk Invite Form -->
        <div *ngIf="bulkInviteMode" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Email Addresses <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                type="email"
                [(ngModel)]="bulkEmailInput"
                (keydown.enter)="addBulkEmail()"
                placeholder="Enter email and press Enter"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                (click)="addBulkEmail()"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                Add
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">Enter one email at a time or paste multiple emails separated by commas</p>
          </div>

          <!-- Bulk Email Tags -->
          <div *ngIf="bulkInviteEmails.length > 0" class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
            <span *ngFor="let email of bulkInviteEmails; let i = index" 
                  class="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {{ email }}
              <button
                (click)="removeBulkEmail(i)"
                class="ml-2 text-indigo-600 hover:text-indigo-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Role for All <span class="text-red-500">*</span>
            </label>
            <select
              [(ngModel)]="bulkInviteRole"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="OBSERVER">Observer</option>
            </select>
          </div>

          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm text-green-800">
              <strong>{{ bulkInviteEmails.length }}</strong> invitation{{ bulkInviteEmails.length !== 1 ? 's' : '' }} will be sent with the role: <strong>{{ bulkInviteRole }}</strong>
            </p>
          </div>

          <p *ngIf="inviteError" class="text-sm text-red-600">{{ inviteError }}</p>
          <p *ngIf="inviteSuccess" class="text-sm text-green-600">{{ inviteSuccess }}</p>
        </div>
      </div>
    </app-modal>

    <!-- Task View/Edit Modal -->
    <app-modal
      [isOpen]="showTaskModal"
      [title]="editingTask && !isEditMode ? 'Détails de la tâche' : (editingTask ? 'Modifier la tâche' : 'Créer une nouvelle tâche')"
      [icon]="'info'"
      [confirmText]="editingTask && !isEditMode ? 'Modifier' : (editingTask ? 'Mettre à jour' : 'Créer')"
      [confirmDisabled]="isEditMode && (taskForm.invalid || savingTask)"
      [cancelText]="editingTask && !isEditMode ? 'Fermer' : 'Annuler'"
      [showConfirm]="!editingTask || isEditMode || canEditTask"
      (close)="closeTaskModal()"
      (confirmed)="editingTask && !isEditMode ? enableEditMode() : submitTask()">
      
      <!-- View Mode -->
      <div *ngIf="editingTask && !isEditMode" class="space-y-6">
        <!-- Task Header -->
        <div class="border-b border-gray-200 pb-4">
          <div class="flex items-start justify-between mb-3">
            <h2 class="text-2xl font-bold text-gray-900">{{ editingTask.title }}</h2>
            <div class="flex items-center space-x-2">
              <span *ngIf="editingTask.priority" [class]="getPriorityBadgeClass(editingTask.priority)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ editingTask.priority }}
              </span>
              <span [class]="getStatusBadgeClass(editingTask.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ editingTask.status?.replace('_', ' ') }}
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center text-gray-600">
              <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p class="text-xs text-gray-500">Created</p>
                <p class="font-medium">{{ editingTask.createdAt | date:'medium' }}</p>
              </div>
            </div>
            <div class="flex items-center text-gray-600">
              <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-xs text-gray-500">Last Updated</p>
                <p class="font-medium">{{ editingTask.updatedAt | date:'medium' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Details Grid -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Assigned To -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
            <div *ngIf="editingTask.assignedTo" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ editingTask.assignedTo.firstName?.charAt(0) }}{{ editingTask.assignedTo.lastName?.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ editingTask.assignedTo.firstName }} {{ editingTask.assignedTo.lastName }}</p>
                <p class="text-sm text-gray-500">{{ editingTask.assignedTo.email }}</p>
              </div>
            </div>
            <div *ngIf="!editingTask.assignedTo" class="p-3 bg-gray-50 rounded-lg text-gray-500 text-center">
              Unassigned
            </div>
          </div>

          <!-- Created By -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Created By</label>
            <div *ngIf="editingTask.createdBy" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ editingTask.createdBy.firstName?.charAt(0) }}{{ editingTask.createdBy.lastName?.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ editingTask.createdBy.firstName }} {{ editingTask.createdBy.lastName }}</p>
                <p class="text-sm text-gray-500">{{ editingTask.createdBy.email }}</p>
              </div>
            </div>
          </div>

          <!-- Due Date -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
            <div class="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span *ngIf="editingTask.dueDate" class="text-gray-900">{{ editingTask.dueDate | date:'medium' }}</span>
              <span *ngIf="!editingTask.dueDate" class="text-gray-500">No due date set</span>
            </div>
          </div>

          <!-- End Date -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <div class="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span *ngIf="editingTask.endDate" class="text-gray-900">{{ editingTask.endDate | date:'medium' }}</span>
              <span *ngIf="!editingTask.endDate" class="text-gray-500">Not completed</span>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <div class="p-4 bg-gray-50 rounded-lg min-h-[100px]">
            <p *ngIf="editingTask.description" class="text-gray-700 whitespace-pre-wrap">{{ editingTask.description }}</p>
            <p *ngIf="!editingTask.description" class="text-gray-500 italic">No description provided</p>
          </div>
        </div>

        <!-- Task History -->
        <div *ngIf="taskHistory && taskHistory.length > 0">
          <label class="block text-sm font-semibold text-gray-700 mb-3">Activity History</label>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            <div *ngFor="let change of taskHistory" class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-sm font-medium text-gray-900">{{ change.changedBy?.firstName }} {{ change.changedBy?.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ change.changedAt | date:'short' }}</p>
                </div>
                <p class="text-sm text-gray-700">
                  <span class="font-medium">{{ change.changeType?.replace('_', ' ') }}</span>
                  <span *ngIf="change.oldValue"> from <span class="font-mono bg-gray-200 px-1 rounded">{{ change.oldValue }}</span></span>
                  <span *ngIf="change.newValue"> to <span class="font-mono bg-gray-200 px-1 rounded">{{ change.newValue }}</span></span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions for non-editable view -->
        <div *ngIf="!canEditTask" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium">Lecture seule</p>
              <p class="mt-1">Vous n'avez pas la permission de modifier cette tâche.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit/Create Mode -->
      <form *ngIf="!editingTask || isEditMode" [formGroup]="taskForm" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Titre de la tâche <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            formControlName="title"
            placeholder="Entrez le titre de la tâche"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="mt-1 text-sm text-red-600">
            Le titre est requis
          </p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            formControlName="description"
            rows="4"
            placeholder="Décrivez la tâche en détail..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">{{ taskForm.get('description')?.value?.length || 0 }} caractères</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Priorité <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="priority"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="LOW">🟢 Basse</option>
              <option value="MEDIUM">🟡 Moyenne</option>
              <option value="HIGH">🔴 Haute</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Statut <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="TODO">📋 À faire</option>
              <option value="IN_PROGRESS">⚙️ En cours</option>
              <option value="DONE">✅ Terminé</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Date d'échéance
            </label>
            <input
              type="datetime-local"
              formControlName="dueDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="datetime-local"
              formControlName="endDate"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p class="mt-1 text-xs text-gray-500">Quand la tâche a été/sera terminée</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Assigner à
          </label>
          <select
            formControlName="assignedToId"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option [value]="null">👤 Non assigné</option>
            <option *ngFor="let member of members" [value]="member.user.id">
              {{ member.user.firstName }} {{ member.user.lastName }} ({{ member.role }})
            </option>
          </select>
        </div>

        <!-- Save hint for edit mode -->
        <div *ngIf="editingTask && isEditMode" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-sm text-yellow-800">
            <strong>Note :</strong> Les modifications seront suivies dans l'historique d'activité
          </p>
        </div>

        <p *ngIf="taskError" class="text-sm text-red-600 flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ taskError }}
        </p>
      </form>
    </app-modal>
  `
})
export class ProjectDetailNewComponent implements OnInit {
  project: Project | null = null;
  members: ProjectMember[] = [];
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  currentUser: any;

  // Filters and search
  searchQuery: string = '';
  selectedPriority: string = '';
  selectedAssignee: string = '';
  showOverdueTasks: boolean = false;
  showFilters: boolean = false;
  
  // Sorting
  columnSort: {
    todo: 'priority' | 'dueDate' | 'assignee' | 'none';
    inProgress: 'priority' | 'dueDate' | 'assignee' | 'none';
    done: 'priority' | 'dueDate' | 'assignee' | 'none';
  } = {
    todo: 'none',
    inProgress: 'none',
    done: 'none'
  };

  showMembersModal = false;
  showInviteModal = false;
  showTaskModal = false;
  showPendingInvitationsModal = false;
  showRemoveMemberModal = false;

  inviteForm: FormGroup;
  taskForm: FormGroup;
  inviting = false;
  inviteError = '';
  inviteSuccess = '';
  savingTask = false;
  taskError = '';
  editingTask: Task | null = null;
  isEditMode = false;
  taskHistory: any[] = [];
  
  // Pending invitations
  projectInvitations: any[] = [];
  pendingInvitationsCount = 0;
  loadingInvitations = false;
  resendingInvitation: number | null = null;
  cancelingInvitation: number | null = null;
  
  // Bulk invite
  bulkInviteMode = false;
  bulkInviteEmails: string[] = [];
  bulkEmailInput = '';
  bulkInviteRole = 'MEMBER';
  
  // Remove member
  memberToRemove: ProjectMember | null = null;
  removingMember = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private invitationService: InvitationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.currentUser = this.authService.getCurrentUser();

    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['MEMBER', Validators.required]
    });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['MEDIUM'],
      status: ['TODO'],
      dueDate: [''],
      endDate: [''],
      assignedToId: [null]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject(id);
    this.loadMembers(id);
    this.loadTasks(id);
    this.loadPendingInvitations();
  }

  loadProject(id: number): void {
    this.projectService.getProjectById(id).subscribe({
      next: (project: any) => this.project = project
    });
  }

  loadMembers(projectId: number): void {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (members: any) => this.members = members
    });
  }

  loadTasks(projectId: number): void {
    this.taskService.getProjectTasks(projectId).subscribe({
      next: (tasks: any) => {
        // Apply filters and sort
        const filtered = this.filterTasks(tasks);
        this.todoTasks = this.sortTasks(filtered.filter((t: Task) => t.status === TaskStatus.TODO), 'todo');
        this.inProgressTasks = this.sortTasks(filtered.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS), 'inProgress');
        this.doneTasks = this.sortTasks(filtered.filter((t: Task) => t.status === TaskStatus.DONE), 'done');
      }
    });
  }

  // Filter tasks based on search and filter criteria
  filterTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => {
      // Search query filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        const matchesAssignee = task.assignedTo?.firstName.toLowerCase().includes(query) || 
                                task.assignedTo?.lastName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription && !matchesAssignee) {
          return false;
        }
      }
      
      // Priority filter
      if (this.selectedPriority && task.priority !== this.selectedPriority) {
        return false;
      }
      
      // Assignee filter
      if (this.selectedAssignee) {
        if (this.selectedAssignee === 'unassigned' && task.assignedTo) {
          return false;
        }
        if (this.selectedAssignee !== 'unassigned' && task.assignedTo?.id.toString() !== this.selectedAssignee) {
          return false;
        }
      }
      
      // Overdue filter
      if (this.showOverdueTasks) {
        if (!task.dueDate || new Date(task.dueDate) > new Date()) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Sort tasks based on column sort option
  sortTasks(tasks: Task[], column: 'todo' | 'inProgress' | 'done'): Task[] {
    const sortOption = this.columnSort[column];
    if (sortOption === 'none') return tasks;
    
    return [...tasks].sort((a, b) => {
      switch (sortOption) {
        case 'priority':
          const priorityOrder: any = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (priorityOrder[b.priority || 'LOW'] || 0) - (priorityOrder[a.priority || 'LOW'] || 0);
        
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'assignee':
          const aName = a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : 'Unassigned';
          const bName = b.assignedTo ? `${b.assignedTo.firstName} ${b.assignedTo.lastName}` : 'Unassigned';
          return aName.localeCompare(bName);
        
        default:
          return 0;
      }
    });
  }

  // Apply filters
  applyFilters(): void {
    if (this.project) {
      this.loadTasks(this.project.id);
    }
  }

  // Clear all filters
  clearFilters(): void {
    this.searchQuery = '';
    this.selectedPriority = '';
    this.selectedAssignee = '';
    this.showOverdueTasks = false;
    this.columnSort = { todo: 'none', inProgress: 'none', done: 'none' };
    if (this.project) {
      this.loadTasks(this.project.id);
    }
  }

  // Toggle column sort
  toggleSort(column: 'todo' | 'inProgress' | 'done'): void {
    const options: Array<'priority' | 'dueDate' | 'assignee' | 'none'> = ['none', 'priority', 'dueDate', 'assignee'];
    const currentIndex = options.indexOf(this.columnSort[column]);
    this.columnSort[column] = options[(currentIndex + 1) % options.length];
    if (this.project) {
      this.loadTasks(this.project.id);
    }
  }

  // Get active filters count
  get activeFiltersCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedPriority) count++;
    if (this.selectedAssignee) count++;
    if (this.showOverdueTasks) count++;
    if (this.columnSort.todo !== 'none') count++;
    if (this.columnSort.inProgress !== 'none') count++;
    if (this.columnSort.done !== 'none') count++;
    return count;
  }

  // Check if task is overdue
  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  }

  // Get task stats
  get taskStats() {
    const allTasks = [...this.todoTasks, ...this.inProgressTasks, ...this.doneTasks];
    const total = allTasks.length;
    const completed = this.doneTasks.length;
    const overdue = allTasks.filter(t => this.isTaskOverdue(t)).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, overdue, completionRate };
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromList(event.container.data);

      this.taskService.updateTask(task.id, { status: newStatus }).subscribe();
    }
  }

  getStatusFromList(list: Task[]): TaskStatus {
    if (list === this.todoTasks) return TaskStatus.TODO;
    if (list === this.inProgressTasks) return TaskStatus.IN_PROGRESS;
    return TaskStatus.DONE;
  }

  getPriorityBadgeClass(priority: string): string {
    const classes: Record<string, string> = {
      'LOW': 'bg-gray-100 text-gray-700 border border-gray-300',
      'MEDIUM': 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      'HIGH': 'bg-red-100 text-red-700 border border-red-300'
    };
    return classes[priority] || '';
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-700',
      'MEMBER': 'bg-blue-100 text-blue-700',
      'OBSERVER': 'bg-gray-100 text-gray-700'
    };
    return classes[role] || '';
  }

  get canManageMembers(): boolean {
    if (!this.members || !this.currentUser) return false;
    const currentMember = this.members.find(m => m.user.id === this.currentUser.id);
    return currentMember?.role === 'ADMIN' || currentMember?.role === 'OWNER';
  }

  openTaskModal(): void {
    this.showTaskModal = true;
    this.editingTask = null;
    this.taskForm.reset({
      priority: 'MEDIUM',
      status: 'TODO'
    });
    this.taskError = '';
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
    this.isEditMode = false;
    this.taskHistory = [];
    this.taskForm.reset({
      priority: 'MEDIUM',
      status: 'TODO'
    });
    this.taskError = '';
  }

  submitTask(): void {
    if (this.taskForm.valid && this.project && !this.savingTask) {
      this.savingTask = true;
      this.taskError = '';

      const taskData = {
        ...this.taskForm.value,
        projectId: this.project.id
      };

      const request = this.editingTask
        ? this.taskService.updateTask(this.editingTask.id, taskData)
        : this.taskService.createTask(taskData);

      request.subscribe({
        next: () => {
          this.savingTask = false;
          this.closeTaskModal();
          this.loadTasks(this.project!.id);
        },
        error: (err) => {
          this.taskError = err.error?.message || 'Failed to save task';
          this.savingTask = false;
        }
      });
    }
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.inviteForm.reset({ role: 'MEMBER' });
    this.inviteError = '';
    this.inviteSuccess = '';
    this.bulkInviteMode = false;
    this.bulkInviteEmails = [];
    this.bulkEmailInput = '';
    this.bulkInviteRole = 'MEMBER';
  }

  submitInvitation(): void {
    if (this.inviteForm.valid && this.project && !this.inviting) {
      this.inviting = true;
      this.inviteError = '';
      this.inviteSuccess = '';

      this.invitationService.createInvitation(this.project.id, this.inviteForm.value).subscribe({
        next: () => {
          this.inviting = false;
          this.inviteSuccess = 'Invitation sent successfully!';
          this.loadPendingInvitations();
          setTimeout(() => this.closeInviteModal(), 2000);
        },
        error: (err) => {
          this.inviteError = err.error?.message || 'Failed to send invitation';
          this.inviting = false;
        }
      });
    }
  }

  // Bulk Invite Methods
  addBulkEmail(): void {
    const emails = this.bulkEmailInput.split(',').map(e => e.trim()).filter(e => e);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    emails.forEach(email => {
      if (emailRegex.test(email) && !this.bulkInviteEmails.includes(email)) {
        this.bulkInviteEmails.push(email);
      }
    });
    
    this.bulkEmailInput = '';
  }

  removeBulkEmail(index: number): void {
    this.bulkInviteEmails.splice(index, 1);
  }

  submitBulkInvitations(): void {
    if (this.bulkInviteEmails.length === 0 || !this.project || this.inviting) return;
    
    this.inviting = true;
    this.inviteError = '';
    this.inviteSuccess = '';
    
    let successCount = 0;
    let errorCount = 0;
    
    this.bulkInviteEmails.forEach((email, index) => {
      const inviteData = { email, role: this.bulkInviteRole as InvitationRole };
      
      this.invitationService.createInvitation(this.project!.id, inviteData).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === this.bulkInviteEmails.length) {
            this.inviting = false;
            this.inviteSuccess = `${successCount} invitation(s) sent successfully!`;
            this.loadPendingInvitations();
            setTimeout(() => this.closeInviteModal(), 2000);
          }
        },
        error: () => {
          errorCount++;
          if (successCount + errorCount === this.bulkInviteEmails.length) {
            this.inviting = false;
            this.inviteError = `${successCount} succeeded, ${errorCount} failed`;
          }
        }
      });
    });
  }

  // Pending Invitations Methods
  loadPendingInvitations(): void {
    if (!this.project) return;
    
    this.loadingInvitations = true;
    this.invitationService.getProjectInvitations(this.project.id).subscribe({
      next: (invitations) => {
        this.projectInvitations = invitations.filter((inv: any) => inv.status === 'PENDING');
        this.pendingInvitationsCount = this.projectInvitations.length;
        this.loadingInvitations = false;
      },
      error: () => {
        this.loadingInvitations = false;
      }
    });
  }

  closePendingInvitationsModal(): void {
    this.showPendingInvitationsModal = false;
  }

  resendInvitation(invitationId: number): void {
    this.resendingInvitation = invitationId;
    this.invitationService.resendInvitation(invitationId.toString()).subscribe({
      next: () => {
        this.resendingInvitation = null;
        alert('Invitation resent successfully!');
      },
      error: (err: any) => {
        this.resendingInvitation = null;
        alert('Failed to resend invitation: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  cancelInvitation(invitationId: number): void {
    this.cancelingInvitation = invitationId;
    this.invitationService.cancelInvitation(invitationId).subscribe({
      next: () => {
        this.cancelingInvitation = null;
        this.loadPendingInvitations();
      },
      error: (err: any) => {
        this.cancelingInvitation = null;
        alert('Failed to cancel invitation: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  // Role Management Methods
  changeRole(memberId: number, event: any): void {
    const newRole = event.target.value;
    if (!this.project) return;
    
    if (confirm(`Are you sure you want to change this member's role to ${newRole}?`)) {
      this.projectService.updateMemberRole(this.project.id, memberId, newRole).subscribe({
        next: () => {
          this.loadMembers(this.project!.id);
          alert('Role updated successfully!');
        },
        error: (err) => {
          alert('Failed to update role: ' + (err.error?.message || 'Unknown error'));
          this.loadMembers(this.project!.id); // Reload to reset dropdown
        }
      });
    } else {
      this.loadMembers(this.project!.id); // Reset dropdown
    }
  }

  confirmRemoveMember(member: ProjectMember): void {
    this.memberToRemove = member;
    this.showRemoveMemberModal = true;
  }

  closeRemoveMemberModal(): void {
    this.showRemoveMemberModal = false;
    this.memberToRemove = null;
  }

  removeMember(): void {
    if (!this.memberToRemove || !this.project || this.removingMember) return;
    
    this.removingMember = true;
    this.projectService.removeMember(this.project.id, this.memberToRemove.id).subscribe({
      next: () => {
        this.removingMember = false;
        this.closeRemoveMemberModal();
        this.loadMembers(this.project!.id);
      },
      error: (err) => {
        this.removingMember = false;
        alert('Failed to remove member: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  // Utility Methods
  getRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  }

  viewTask(task: Task): void {
    this.editingTask = task;
    this.isEditMode = false; // Start in view mode
    this.taskHistory = [];
    
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      endDate: (task as any).endDate || '',
      assignedToId: task.assignedTo?.id
    });
    
    // Load task history
    if (task.id) {
      this.loadTaskHistory(task.id);
    }
    
    this.showTaskModal = true;
  }

  enableEditMode(): void {
    if (this.canEditTask) {
      this.isEditMode = true;
    }
  }

  loadTaskHistory(taskId: number): void {
    this.taskService.getTaskHistory(taskId).subscribe({
      next: (history: any) => {
        this.taskHistory = history;
      },
      error: (err: any) => {
        console.error('Error loading task history:', err);
      }
    });
  }

  get canEditTask(): boolean {
    if (!this.project || !this.currentUser) return false;
    
    const member = this.members.find(m => m.user.id === this.currentUser.id);
    if (!member) return false;
    
    // OWNER and ADMIN can edit all tasks
    if (member.role === 'OWNER' || member.role === 'ADMIN') return true;
    
    // MEMBER can edit their own tasks
    if (member.role === 'MEMBER' && this.editingTask) {
      return this.editingTask.assignedTo?.id === this.currentUser.id ||
             this.editingTask.createdBy?.id === this.currentUser.id;
    }
    
    // OBSERVER cannot edit
    return false;
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'TODO': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'DONE': 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
