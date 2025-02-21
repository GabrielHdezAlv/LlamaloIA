import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const headers = new HttpHeaders({
  'Content-Type': 'application/json',
  'Accept': '*/*'
});

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrlLogin = 'https://localhost:7027/api/auth/login';
  private apiUrlRegister = 'https://localhost:7027/api/auth/register';

  constructor(private http: HttpClient) { }

  LoginUser(user: LoginUser): Observable<any> {
    return this.http.post<any>(this.apiUrlLogin, user, { headers });
  }

  RegisterUser(newUser: NewUser): Observable<any> {
    return this.http.post<any>(this.apiUrlRegister, newUser, { headers });
  }
}

export class LoginUser {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class NewUser {
  name: string;
  lastname: string;
  email: string;
  password: string;

  constructor(name: string, lastname: string, email: string, password: string) {
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
  }
}

