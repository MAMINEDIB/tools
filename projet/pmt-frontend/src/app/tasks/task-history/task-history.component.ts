import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskHistoryService } from '../../services/task-history.service';

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl shadow-xl p-6 max-h-[600px] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div class="flex items-center">
          <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl mr-3 shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Task History</h2>
            <p class="text-sm text-gray-500">Track all changes and updates</p>
          </div>
        </div>

        <!-- Filter Buttons -->
        <div class="flex gap-2">
          <button
            (click)="selectedFilter = null; loadHistory()"
            [class.bg-indigo-600]="selectedFilter === null"
            [class.text-white]="selectedFilter === null"
            [class.bg-gray-100]="selectedFilter !== null"
            [class.text-gray-600]="selectedFilter !== null"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-md">
            All
          </button>
          <button
            (click)="selectedFilter = 'STATUS_CHANGED'; loadHistory()"
            [class.bg-indigo-600]="selectedFilter === 'STATUS_CHANGED'"
            [class.text-white]="selectedFilter === 'STATUS_CHANGED'"
            [class.bg-gray-100]="selectedFilter !== 'STATUS_CHANGED'"
            [class.text-gray-600]="selectedFilter !== 'STATUS_CHANGED'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-md">
            Status
          </button>
          <button
            (click)="selectedFilter = 'ASSIGNED'; loadHistory()"
            [class.bg-indigo-600]="selectedFilter === 'ASSIGNED'"
            [class.text-white]="selectedFilter === 'ASSIGNED'"
            [class.bg-gray-100]="selectedFilter !== 'ASSIGNED'"
            [class.text-gray-600]="selectedFilter !== 'ASSIGNED'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-md">
            Assigned
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && history.length === 0" class="text-center py-12">
        <div class="bg-gray-100 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-1">No History Yet</h3>
        <p class="text-sm text-gray-500">Changes to this task will appear here</p>
      </div>

      <!-- Timeline -->
      <div *ngIf="!loading && history.length > 0" class="relative">
        <!-- Vertical Line -->
        <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"></div>

        <!-- History Items -->
        <div *ngFor="let item of history; let i = index" 
             class="relative pb-8 last:pb-0 group"
             [@fadeIn]>
          <!-- Timeline Dot -->
          <div class="absolute left-5 top-2 w-7 h-7 rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center transition-transform group-hover:scale-110"
               [ngClass]="getTimelineDotClass(item.changeType)">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(item.changeType)"></path>
            </svg>
          </div>

          <!-- Content Card -->
          <div class="ml-20 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all border border-gray-100 group-hover:border-indigo-200">
            <!-- Header -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center">
                <!-- User Avatar -->
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-2 shadow-md">
                  {{ item.changedBy.firstName[0] }}{{ item.changedBy.lastName[0] }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ item.changedBy.firstName }} {{ item.changedBy.lastName }}
                  </p>
                  <p class="text-xs text-gray-500">{{ item.changedBy.email }}</p>
                </div>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(item.changedAt) }}</span>
            </div>

            <!-- Change Type Badge -->
            <div class="mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium"
                    [ngClass]="getChangeTypeBadgeClass(item.changeType)">
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(item.changeType)"></path>
                </svg>
                {{ formatChangeType(item.changeType) }}
              </span>
            </div>

            <!-- Change Details -->
            <div class="bg-white rounded-lg p-3 border border-gray-200">
              <div *ngIf="item.oldValue" class="mb-2">
                <p class="text-xs text-gray-500 mb-1">From:</p>
                <p class="text-sm text-gray-700 line-through opacity-60">{{ item.oldValue }}</p>
              </div>
              <div *ngIf="item.newValue">
                <p class="text-xs text-gray-500 mb-1">{{ item.oldValue ? 'To:' : 'Value:' }}</p>
                <p class="text-sm font-medium text-gray-900">{{ item.newValue }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .group:hover {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class TaskHistoryComponent implements OnInit {
  @Input() taskId!: number;
  
  history: any[] = [];
  loading = false;
  selectedFilter: string | null = null;

  constructor(private taskHistoryService: TaskHistoryService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.taskHistoryService.getTaskHistory(this.taskId).subscribe({
      next: (data: any) => {
        this.history = this.selectedFilter 
          ? data.filter((h: any) => h.changeType === this.selectedFilter)
          : data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading history:', err);
        this.loading = false;
      }
    });
  }

  getTimelineDotClass(changeType: string): string {
    const classes: { [key: string]: string } = {
      'CREATED': 'bg-green-500',
      'STATUS_CHANGED': 'bg-blue-500',
      'ASSIGNED': 'bg-purple-500',
      'PRIORITY_CHANGED': 'bg-orange-500',
      'DESCRIPTION_UPDATED': 'bg-yellow-500',
      'DUE_DATE_CHANGED': 'bg-pink-500'
    };
    return classes[changeType] || 'bg-gray-500';
  }

  getChangeTypeBadgeClass(changeType: string): string {
    const classes: { [key: string]: string } = {
      'CREATED': 'bg-green-100 text-green-800',
      'STATUS_CHANGED': 'bg-blue-100 text-blue-800',
      'ASSIGNED': 'bg-purple-100 text-purple-800',
      'PRIORITY_CHANGED': 'bg-orange-100 text-orange-800',
      'DESCRIPTION_UPDATED': 'bg-yellow-100 text-yellow-800',
      'DUE_DATE_CHANGED': 'bg-pink-100 text-pink-800'
    };
    return classes[changeType] || 'bg-gray-100 text-gray-800';
  }

  getIconPath(changeType: string): string {
    const icons: { [key: string]: string } = {
      'CREATED': 'M12 4v16m8-8H4',
      'STATUS_CHANGED': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'ASSIGNED': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'PRIORITY_CHANGED': 'M5 10l7-7m0 0l7 7m-7-7v18',
      'DESCRIPTION_UPDATED': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      'DUE_DATE_CHANGED': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    };
    return icons[changeType] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  formatChangeType(changeType: string): string {
    const labels: { [key: string]: string } = {
      'CREATED': 'Task Created',
      'STATUS_CHANGED': 'Status Changed',
      'ASSIGNED': 'Assigned',
      'PRIORITY_CHANGED': 'Priority Changed',
      'DESCRIPTION_UPDATED': 'Description Updated',
      'DUE_DATE_CHANGED': 'Due Date Changed'
    };
    return labels[changeType] || changeType;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
