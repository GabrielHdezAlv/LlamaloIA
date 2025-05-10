import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewUser } from '../../shared/models/new-user.model';
import { LoginUser } from '../../shared/models/login-user.model';

const headers = new HttpHeaders({
  'Content-Type': 'application/json',
  Accept: '*/*',
});

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://localhost:7027/api';

  constructor(private http: HttpClient) {}

  LoginUser(user: LoginUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, user, { headers });
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.apiUrl}/user/profile`, { headers });
  }

  RegisterUser(newUser: NewUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, newUser, { headers });
  }
}
