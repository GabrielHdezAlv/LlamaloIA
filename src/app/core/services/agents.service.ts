import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Agent } from '../../shared/models/agent.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://llamaloiabackend.onrender.com/agents';
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

  // Método para obtener la configuración de Twilio del usuario
  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.apiUrl}/allAgents`, {
      headers: this.getAuthHeaders(),
    });
  }

  setAgentConfig(agent: Agent): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/setAgentConfig`, agent, {
      headers: this.getAuthHeaders(),
    });
  }
}
