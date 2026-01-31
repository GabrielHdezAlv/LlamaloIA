import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  TwilioConfig,
  TwilioConfigRequest,
} from '../../shared/models/twilio-config.model';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

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
  validatePhone(countryCode: string, number: string, twilioAccountId?: number): Observable<{ message: string }> {
    const body: { countryCode: string; number: string; twilioAccountId?: number } = {
      countryCode: countryCode.startsWith('+') ? countryCode : `+${countryCode}`,
      number: number.trim()
    };
    
    if (twilioAccountId !== undefined) {
      body.twilioAccountId = twilioAccountId;
    }
    
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/validate-phone`,
      body,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Nuevo método para crear/importar un número de teléfono desde Twilio
  createPhoneNumber(
    countryCode: string,
    number: string,
    twilioSid: string,
    twilioToken: string,
    twilioAccountId?: number
  ): Observable<{ message: string }> {
    const body: {
      countryCode: string;
      number: string;
      twilioSid: string;
      twilioToken: string;
      twilioAccountId?: number;
    } = {
      countryCode: countryCode.startsWith('+') ? countryCode : `+${countryCode}`,
      number: number.trim(),
      twilioSid,
      twilioToken,
    };
    
    if (twilioAccountId !== undefined) {
      body.twilioAccountId = twilioAccountId;
    }
    
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/phone-number`,
      body,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // Método para eliminar un número de teléfono
  deletePhoneNumber(phoneId: number): Observable<{ message: string; affectedAgents: number }> {
    const request = new HttpRequest(
      'DELETE',
      `${this.apiUrl}/phone-number`,
      { phoneId },
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.http.request<{ message: string; affectedAgents: number }>(request).pipe(
      filter((event): event is HttpResponse<{ message: string; affectedAgents: number }> => 
        event instanceof HttpResponse
      ),
      map(event => event.body!)
    );
  }
}
