import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../shared/services/project.service';
import { TaskService } from '../../shared/services/task.service';
import { Project } from '../../shared/models/project.model';
import { Task, TaskStatus } from '../../shared/models/task.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <button (click)="goBack()" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ project?.name }}</h1>
          </div>
          <button (click)="createTask()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg transition-all">
            + New Task
          </button>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="grid grid-cols-3 gap-6">
          <!-- TO DO Column -->
          <div class="bg-gray-100 rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 flex items-center">
                <span class="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                TO DO
                <span class="ml-2 text-sm text-gray-500">({{ todoTasks.length }})</span>
              </h3>
            </div>
            <div
              cdkDropList
              #todoList="cdkDropList"
              [cdkDropListData]="todoTasks"
              [cdkDropListConnectedTo]="[inProgressList, doneList]"
              (cdkDropListDropped)="drop($event)"
              class="space-y-3 min-h-[500px]">
              <div *ngFor="let task of todoTasks"
                   cdkDrag
                   class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border-l-4 border-gray-400">
                <h4 class="font-medium text-gray-900 mb-2">{{ task.title }}</h4>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span *ngIf="task.priority" [class]="getPriorityClass(task.priority)" class="px-2 py-1 rounded-full">
                    {{ task.priority }}
                  </span>
                  <span class="text-gray-500">{{ task.assignedTo?.fullName || 'Unassigned' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- IN PROGRESS Column -->
          <div class="bg-blue-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 flex items-center">
                <span class="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                IN PROGRESS
                <span class="ml-2 text-sm text-gray-500">({{ inProgressTasks.length }})</span>
              </h3>
            </div>
            <div
              cdkDropList
              #inProgressList="cdkDropList"
              [cdkDropListData]="inProgressTasks"
              [cdkDropListConnectedTo]="[todoList, doneList]"
              (cdkDropListDropped)="drop($event)"
              class="space-y-3 min-h-[500px]">
              <div *ngFor="let task of inProgressTasks"
                   cdkDrag
                   class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border-l-4 border-blue-500">
                <h4 class="font-medium text-gray-900 mb-2">{{ task.title }}</h4>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span *ngIf="task.priority" [class]="getPriorityClass(task.priority)" class="px-2 py-1 rounded-full">
                    {{ task.priority }}
                  </span>
                  <span class="text-gray-500">{{ task.assignedTo?.fullName || 'Unassigned' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- DONE Column -->
          <div class="bg-green-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900 flex items-center">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                DONE
                <span class="ml-2 text-sm text-gray-500">({{ doneTasks.length }})</span>
              </h3>
            </div>
            <div
              cdkDropList
              #doneList="cdkDropList"
              [cdkDropListData]="doneTasks"
              [cdkDropListConnectedTo]="[todoList, inProgressList]"
              (cdkDropListDropped)="drop($event)"
              class="space-y-3 min-h-[500px]">
              <div *ngFor="let task of doneTasks"
                   cdkDrag
                   class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border-l-4 border-green-500 opacity-75">
                <h4 class="font-medium text-gray-900 mb-2">{{ task.title }}</h4>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ task.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span *ngIf="task.priority" [class]="getPriorityClass(task.priority)" class="px-2 py-1 rounded-full">
                    {{ task.priority }}
                  </span>
                  <span class="text-gray-500">{{ task.assignedTo?.fullName || 'Unassigned' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject(id);
    this.loadTasks(id);
  }

  loadProject(id: number): void {
    this.projectService.getProjectById(id).subscribe({
      next: (project: any) => this.project = project
    });
  }

  loadTasks(projectId: number): void {
    this.taskService.getProjectTasks(projectId).subscribe({
      next: (tasks: any) => {
        this.todoTasks = tasks.filter((t: Task) => t.status === TaskStatus.TODO);
        this.inProgressTasks = tasks.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS);
        this.doneTasks = tasks.filter((t: Task) => t.status === TaskStatus.DONE);
      }
    });
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

  getPriorityClass(priority: string): string {
    const classes: any = {
      'LOW': 'bg-gray-100 text-gray-700',
      'MEDIUM': 'bg-yellow-100 text-yellow-700',
      'HIGH': 'bg-red-100 text-red-700'
    };
    return classes[priority] || '';
  }

  createTask(): void {
    const title = prompt('Enter task title:');
    if (title && this.project) {
      this.taskService.createTask({
        title,
        projectId: this.project.id,
        status: TaskStatus.TODO
      }).subscribe({
        next: () => this.loadTasks(this.project!.id)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
