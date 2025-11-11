import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const currentUserJson = localStorage.getItem('currentUser');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (currentUserJson) {
      try {
        const currentUser = JSON.parse(currentUserJson);
        if (currentUser && currentUser.id) {
          headers = headers.set('User-Id', currentUser.id.toString());
        }
      } catch (e) {
        console.error('Error parsing currentUser from localStorage', e);
      }
    }
    
    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { 
      headers: this.getHeaders() 
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, { 
      headers: this.getHeaders() 
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, { 
      headers: this.getHeaders() 
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, { 
      headers: this.getHeaders() 
    });
  }
}
