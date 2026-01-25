import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  TwilioConfig,
  TwilioConfigRequest,
} from '../../shared/models/twilio-config.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TwilioService {
  private http = inject(HttpClient);
  private apiUrl = 'https://llamaloiabackend-5294.onrender.com/twilio';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Método para obtener los encabezados de autenticación
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

  // Método para enviar la configuración de Twilio
  setConfig(config: TwilioConfigRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/config`, config, {
      headers: this.getAuthHeaders(),
    });
  }

  // Método para obtener la configuración de Twilio del usuario
  getInfo(): Observable<TwilioConfig> {
    return this.http.get<TwilioConfig>(`${this.apiUrl}/info`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Método para validar un número de teléfono
  validatePhone(phoneNumber: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/validate-phone`,
      { phoneNumber },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}
