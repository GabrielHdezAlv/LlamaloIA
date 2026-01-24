import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Voice } from '../../shared/models/voice.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://llamaloiabackend-5294.onrender.com/voices';
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

  // Método para obtener las voces disponibles
  getAgents(): Observable<Voice[]> {
    return this.http.get<Voice[]>(`${this.apiUrl}/allVoices`, {
      headers: this.getAuthHeaders(),
    });
  }

  setAgentConfig(voice: Voice, language: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/setVoiceConfig`, {
      voiceId: voice.voiceId,
      language: language
    }, {
      headers: this.getAuthHeaders(),
    });
  }
}
