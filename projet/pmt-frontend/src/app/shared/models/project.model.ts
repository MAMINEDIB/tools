export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  OBSERVER = 'OBSERVER'
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdBy: any;
  createdAt: Date;
  updatedAt: Date;
  startDate?: string;
  memberCount: number;
  taskCount: number;
}

export interface ProjectMember {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: Role;
  joinedAt: Date;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}
