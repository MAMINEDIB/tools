import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectCreate, ProjectMember } from '../models/project.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = environment.apiUrl + '/projects';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, {
      headers: this.authService.getUserHeaders()
    });
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getUserHeaders()
    });
  }

  createProject(data: ProjectCreate): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, data, {
      headers: this.authService.getUserHeaders()
    });
  }

  updateProject(id: number, data: ProjectCreate): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data, {
      headers: this.authService.getUserHeaders()
    });
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getUserHeaders()
    });
  }

  getDashboard(projectId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/dashboard`, {
      headers: this.authService.getUserHeaders()
    });
  }

  getProjectMembers(projectId: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/${projectId}/members`, {
      headers: this.authService.getUserHeaders()
    });
  }

  addProjectMember(projectId: number, userId: number, role: string): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(`${this.apiUrl}/${projectId}/members`, { userId, role }, {
      headers: this.authService.getUserHeaders()
    });
  }

  updateMemberRole(projectId: number, memberId: number, role: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${projectId}/members/${memberId}/role`, 
      { role }, 
      { headers: this.authService.getUserHeaders() }
    );
  }

  removeMember(projectId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/members/${memberId}`, {
      headers: this.authService.getUserHeaders()
    });
  }
}
