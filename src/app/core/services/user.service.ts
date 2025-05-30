import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/new-user.model';
import { LoginUser } from '../../shared/models/login-user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://llamaloiabackend.onrender.com';
  private http = inject(HttpClient);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (this.isBrowser) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  LoginUser(user: LoginUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, user, {
      headers: this.getAuthHeaders(),
    });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  RegisterUser(newUser: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, newUser, {
      headers: this.getAuthHeaders(),
    });
  }

  // IDIOMAS
  getLanguages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/allLanguages`);
  }
}
