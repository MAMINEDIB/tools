import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../shared/services/task.service';
import { Task } from '../../shared/models/task.model';

interface TaskHistory {
  id: number;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: {
    id: number;
    firstName: string;
    lastName: string;
  };
  changedAt: Date;
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div *ngIf="task" class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ task.title }}</h1>
              <div class="flex gap-3 items-center text-sm text-gray-500">
                <span>📁 {{ task.projectName }}</span>
                <span>•</span>
                <span>Created {{ task.createdAt | date:'short' }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                (click)="editTask()"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ✏️ Edit
              </button>
              <button
                (click)="deleteTask()"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          </div>

          <!-- Status and Priority Badges -->
          <div class="flex gap-3 mb-4">
            <span class="px-3 py-1 rounded-full text-sm font-medium"
                  [class.bg-gray-200]="task.status === 'TODO'"
                  [class.text-gray-700]="task.status === 'TODO'"
                  [class.bg-blue-100]="task.status === 'IN_PROGRESS'"
                  [class.text-blue-700]="task.status === 'IN_PROGRESS'"
                  [class.bg-green-100]="task.status === 'DONE'"
                  [class.text-green-700]="task.status === 'DONE'">
              {{ task.status }}
            </span>
            <span *ngIf="task.priority"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  [class.bg-red-100]="task.priority === 'HIGH'"
                  [class.text-red-700]="task.priority === 'HIGH'"
                  [class.bg-yellow-100]="task.priority === 'MEDIUM'"
                  [class.text-yellow-700]="task.priority === 'MEDIUM'"
                  [class.bg-green-100]="task.priority === 'LOW'"
                  [class.text-green-700]="task.priority === 'LOW'">
              {{ task.priority }} Priority
            </span>
            <span *ngIf="task.overdue" class="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
              ⚠️ Overdue
            </span>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
            <p class="text-gray-600 whitespace-pre-wrap">{{ task.description || 'No description provided' }}</p>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p class="text-sm text-gray-500 mb-1">Assigned To</p>
              <p class="font-medium">
                {{ task.assignedTo ? (task.assignedTo.firstName + ' ' + task.assignedTo.lastName) : 'Unassigned' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Created By</p>
              <p class="font-medium">{{ task.createdBy.firstName }} {{ task.createdBy.lastName }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Due Date</p>
              <p class="font-medium">{{ task.dueDate ? (task.dueDate | date:'mediumDate') : 'No due date' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-1">Last Updated</p>
              <p class="font-medium">{{ task.updatedAt | date:'short' }}</p>
            </div>
          </div>
        </div>

        <!-- History Timeline -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Activity History</h2>
          
          <div *ngIf="history.length === 0" class="text-center text-gray-500 py-8">
            No activity history yet
          </div>

          <div *ngIf="history.length > 0" class="space-y-4">
            <div *ngFor="let entry of history" class="flex gap-4 border-l-2 border-gray-300 pl-4 pb-4">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-sm">📝</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">
                    {{ entry.changedBy.firstName }} {{ entry.changedBy.lastName }}
                  </span>
                  <span class="text-sm text-gray-500">
                    changed {{ entry.field }}
                  </span>
                </div>
                <div class="text-sm text-gray-600 mb-1">
                  <span class="line-through text-gray-400">{{ entry.oldValue || 'None' }}</span>
                  →
                  <span class="font-medium">{{ entry.newValue }}</span>
                </div>
                <div class="text-xs text-gray-400">
                  {{ entry.changedAt | date:'medium' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Back Button -->
        <div class="mt-6">
          <button
            (click)="goBack()"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            ← Back to Project
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="!task && !errorMessage" class="flex justify-center items-center h-64">
        <div class="text-gray-500">Loading task details...</div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="max-w-4xl mx-auto px-4">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  history: TaskHistory[] = [];
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTask(taskId);
    this.loadHistory(taskId);
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load task details';
        console.error(err);
      }
    });
  }

  loadHistory(taskId: number): void {
    this.taskService.getTaskHistory(taskId).subscribe({
      next: (history) => {
        this.history = history;
      },
      error: (err) => {
        console.error('Failed to load task history', err);
      }
    });
  }

  editTask(): void {
    if (this.task) {
      this.router.navigate(['/tasks', this.task.id, 'edit'], {
        queryParams: { projectId: this.task.projectId }
      });
    }
  }

  deleteTask(): void {
    if (!this.task) return;

    if (confirm(`Are you sure you want to delete "${this.task.title}"?`)) {
      this.taskService.deleteTask(this.task.id).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.task!.projectId]);
        },
        error: (err) => {
          alert('Failed to delete task');
          console.error(err);
        }
      });
    }
  }

  goBack(): void {
    if (this.task) {
      this.router.navigate(['/projects', this.task.projectId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}
