import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../shared/services/project.service';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">Create New Project</h2>
          
          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
              />
              <p *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" 
                 class="mt-1 text-sm text-red-600">
                Project name is required
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                formControlName="description"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project description (optional)"
              ></textarea>
            </div>

            <div class="flex gap-4">
              <button
                type="submit"
                [disabled]="projectForm.invalid || loading"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? 'Creating...' : 'Create Project' }}
              </button>
              <button
                type="button"
                (click)="cancel()"
                class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p *ngIf="error" class="text-sm text-red-600 text-center">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProjectCreateComponent {
  projectForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      this.error = '';

      this.projectService.createProject(this.projectForm.value).subscribe({
        next: (project) => {
          this.router.navigate(['/projects', project.id]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create project';
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/projects']);
  }
}
