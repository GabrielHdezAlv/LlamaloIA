import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginUser } from '../../shared/models/login-user.model';
import { CreateUserDto } from '../../shared/models/create-user-dto.model';
import { UpdateProfileDto } from '../../shared/models/update-profile-dto.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://llamaloiabackend-5294.onrender.com';
  private http = inject(HttpClient);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  private getFileUploadHeaders(): HttpHeaders {
    let token = '';
    if (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
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
    return this.http.get(`${this.apiUrl}/users/profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  RegisterUser(newUser: CreateUserDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, newUser, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUserProfile(userData: UpdateProfileDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/profile`, userData, {
      headers: this.getAuthHeaders(),
    });
  }

  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(`${this.apiUrl}/users/profile/image`, formData, {
      headers: this.getFileUploadHeaders(),
    });
  }

  // IDIOMAS
  getLanguages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/languages/allLanguages`, {
      headers: this.getAuthHeaders(),
    });
  }
}
