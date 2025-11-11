export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  projectId: number;
  projectName: string;
  assignedTo?: any;
  createdBy: any;
  dueDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  overdue: boolean;
}

export interface TaskCreate {
  title: string;
  description?: string;
  projectId: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: number;
  dueDate?: Date;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: number;
  dueDate?: Date;
}
