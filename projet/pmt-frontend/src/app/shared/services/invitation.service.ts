import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Invitation, InvitationCreate } from '../models/invitation.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  constructor(private api: ApiService) {}

  createInvitation(projectId: number, data: InvitationCreate): Observable<Invitation> {
    return this.api.post<Invitation>(`invitations/project/${projectId}`, data);
  }

  acceptInvitation(token: string): Observable<void> {
    return this.api.post<void>(`invitations/${token}/accept`, {});
  }

  rejectInvitation(token: string): Observable<void> {
    return this.api.post<void>(`invitations/${token}/reject`, {});
  }

  getProjectInvitations(projectId: number): Observable<Invitation[]> {
    return this.api.get<Invitation[]>(`invitations/project/${projectId}`);
  }

  getPendingInvitations(email: string): Observable<Invitation[]> {
    return this.api.get<Invitation[]>(`invitations/pending?email=${email}`);
  }

  cancelInvitation(id: number): Observable<void> {
    return this.api.delete<void>(`invitations/${id}`);
  }

  resendInvitation(invitationId: string): Observable<void> {
    return this.api.post<void>(`invitations/${invitationId}/resend`, {});
  }
}
