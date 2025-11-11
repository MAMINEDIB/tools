export interface Dashboard {
  projectId: number;
  projectName: string;
  taskCountByStatus: { [key: string]: number };
  totalTasks: number;
  totalMembers: number;
}
