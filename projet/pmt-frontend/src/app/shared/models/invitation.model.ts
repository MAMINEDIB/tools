export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  OBSERVER = 'OBSERVER'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Invitation {
  id: number;
  email: string;
  projectId: number;
  projectName: string;
  role: Role;
  status: InvitationStatus;
  invitedBy: any;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  expired: boolean;
}

export interface InvitationCreate {
  email: string;
  role: Role;
}
