import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../shared/services/task.service';
import { ProjectService } from '../../shared/services/project.service';
import { AuthService } from '../../shared/services/auth.service';
import { TaskStatus, TaskPriority, TaskCreate } from '../../shared/models/task.model';
import { ProjectMember } from '../../shared/models/project.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-3xl mx-auto px-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
            </h2>
            <button
              (click)="goBack()"
              class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
            <!-- Title -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Title <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="title"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title"
              />
              <p *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                 class="text-red-500 text-sm mt-1">
                Title is required
              </p>
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                formControlName="description"
                rows="4"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the task in detail"
              ></textarea>
              <p *ngIf="taskForm.get('description')?.invalid && taskForm.get('description')?.touched"
                 class="text-red-500 text-sm mt-1">
                Description is required
              </p>
            </div>

            <!-- Status and Priority -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  formControlName="status"
                  class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option [value]="TaskStatus.TODO">To Do</option>
                  <option [value]="TaskStatus.IN_PROGRESS">In Progress</option>
                  <option [value]="TaskStatus.DONE">Done</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  formControlName="priority"
                  class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select priority</option>
                  <option [value]="TaskPriority.LOW">Low</option>
                  <option [value]="TaskPriority.MEDIUM">Medium</option>
                  <option [value]="TaskPriority.HIGH">High</option>
                </select>
              </div>
            </div>

            <!-- Assign To -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                formControlName="assignedToId"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                <option *ngFor="let member of projectMembers" [value]="member.user.id">
                  {{ member.user.firstName }} {{ member.user.lastName }} ({{ member.role }})
                </option>
              </select>
            </div>

            <!-- Due Date -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                formControlName="dueDate"
                class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-red-700 text-sm">{{ errorMessage }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                type="submit"
                [disabled]="taskForm.invalid || isSubmitting"
                class="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task') }}
              </button>
              <button
                type="button"
                (click)="goBack()"
                class="px-6 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  projectId!: number;
  taskId?: number;
  projectMembers: ProjectMember[] = [];
  
  // Expose enums to template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: [TaskStatus.TODO, Validators.required],
      priority: [''],
      assignedToId: [''],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    // Get project ID from query params or route
    this.projectId = Number(this.route.snapshot.queryParamMap.get('projectId'));
    
    // Check if edit mode
    const taskIdParam = this.route.snapshot.paramMap.get('id');
    if (taskIdParam && taskIdParam !== 'new') {
      this.isEditMode = true;
      this.taskId = Number(taskIdParam);
      this.loadTask();
    }

    // Load project members for assignment
    if (this.projectId) {
      this.loadProjectMembers();
    }
  }

  loadTask(): void {
    if (this.taskId) {
      this.taskService.getTaskById(this.taskId).subscribe({
        next: (task) => {
          this.projectId = task.projectId;
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority || '',
            assignedToId: task.assignedTo?.id || '',
            dueDate: task.dueDate || ''
          });
          this.loadProjectMembers();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load task';
          console.error(err);
        }
      });
    }
  }

  loadProjectMembers(): void {
    this.projectService.getProjectMembers(this.projectId).subscribe({
      next: (members) => {
        this.projectMembers = members;
      },
      error: (err) => {
        console.error('Failed to load project members', err);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.taskForm.value;
    const taskData = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      priority: formValue.priority || null,
      assignedToId: formValue.assignedToId || null,
      dueDate: formValue.dueDate || null
    };

    if (this.isEditMode && this.taskId) {
      // Update existing task
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update task';
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new task
      const currentUser = this.authService.getCurrentUser();
      const taskCreate: TaskCreate = {
        ...taskData,
        projectId: this.projectId
      };

      this.taskService.createTask(taskCreate).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create task';
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectId]);
  }
}
