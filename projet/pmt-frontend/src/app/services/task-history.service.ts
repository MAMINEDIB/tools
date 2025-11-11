import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface TaskHistory {
  id: number;
  taskId: number;
  changeType: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  changedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskHistoryService {
  private apiUrl = `${environment.apiUrl}/task-history`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Id': userId || ''
    });
  }

  getTaskHistory(taskId: number): Observable<TaskHistory[]> {
    return this.http.get<TaskHistory[]>(`${this.apiUrl}/task/${taskId}`, {
      headers: this.getHeaders()
    });
  }

  createHistory(history: Partial<TaskHistory>): Observable<TaskHistory> {
    return this.http.post<TaskHistory>(this.apiUrl, history, {
      headers: this.getHeaders()
    });
  }
}
