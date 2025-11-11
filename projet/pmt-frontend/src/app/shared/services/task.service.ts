import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskCreate, TaskUpdate, TaskStatus } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl + '/tasks';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  createTask(data: TaskCreate): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, data, {
      headers: this.authService.getUserHeaders()
    });
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getUserHeaders()
    });
  }

  getProjectTasks(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`, {
      headers: this.authService.getUserHeaders()
    });
  }

  getTasksByStatus(projectId: number, status: TaskStatus): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}/status/${status}`, {
      headers: this.authService.getUserHeaders()
    });
  }

  getAssignedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/assigned`, {
      headers: this.authService.getUserHeaders()
    });
  }

  updateTask(id: number, data: TaskUpdate): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, data, {
      headers: this.authService.getUserHeaders()
    });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getUserHeaders()
    });
  }

  getTaskHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`, {
      headers: this.authService.getUserHeaders()
    });
  }
}
