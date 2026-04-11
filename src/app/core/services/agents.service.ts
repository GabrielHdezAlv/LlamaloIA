import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Voice } from '../../shared/models/voice.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { X_HANDLES_PLAN_403 } from '../http/plan-403.headers';
import {
  SetAgentConfigDto,
  CreateAgentResponse,
  UpdateAgentResponse,
  ListAgentsResponse,
  DeleteAgentResponse,
} from '../../shared/models/agent.model';

export interface GenerateAgentInstructionsRequest {
  enterpriseName: string;
  agentName: string;
  callType: 'inbound' | 'outbound';
  language: string;
  voiceId: string;
  voiceParameters: {
    stability: number;
    similarity: number;
    style: number;
    boost: boolean;
    speed: number;
  };
  userDescription: string;
  shopDomain?: string;
}

export interface GenerateAgentInstructionsResponse {
  agentInstruction: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://llamaloiabackend-5294.onrender.com/agents';
  private voicesApiUrl = 'https://llamaloiabackend-5294.onrender.com/voices';
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

  /** Evita snackbar global en 403; el componente muestra modal con CTA. */
  private authHeadersPlan403Handled(): HttpHeaders {
    return this.getAuthHeaders().set(X_HANDLES_PLAN_403, '1');
  }

  // Método para obtener las voces disponibles
  getVoices(): Observable<Voice[]> {
    return this.http.get<Voice[]>(`${this.voicesApiUrl}/allVoices`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Método para crear un nuevo agente
  createAgent(config: SetAgentConfigDto): Observable<CreateAgentResponse> {
    return this.http.post<CreateAgentResponse>(`${this.apiUrl}`, config, {
      headers: this.authHeadersPlan403Handled(),
    });
  }

  generateAgentInstructions(
    payload: GenerateAgentInstructionsRequest,
  ): Observable<GenerateAgentInstructionsResponse> {
    return this.http.post<GenerateAgentInstructionsResponse>(
      `${this.apiUrl}/instructions/generate`,
      payload,
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // Método para listar todos los agentes (con búsqueda opcional)
  getAgentsList(q?: string): Observable<ListAgentsResponse> {
    const hasQuery = q && q.trim().length > 0;

    const options: {
      headers: HttpHeaders;
      params?: { q: string };
    } = {
      headers: this.getAuthHeaders(),
      ...(hasQuery ? { params: { q: q!.trim() } } : {}),
    };

    return this.http.get<ListAgentsResponse>(`${this.apiUrl}`, options);
  }

  // Método para actualizar un agente específico
  updateAgent(
    agentId: number,
    config: SetAgentConfigDto,
  ): Observable<UpdateAgentResponse> {
    return this.http.put<UpdateAgentResponse>(
      `${this.apiUrl}/${agentId}`,
      config,
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // Método para eliminar un agente
  deleteAgent(agentId: number): Observable<DeleteAgentResponse> {
    return this.http.delete<DeleteAgentResponse>(`${this.apiUrl}/${agentId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Método de compatibilidad - obtener voces (mantener por compatibilidad con código existente)
  // @deprecated Usar getVoices() en su lugar
  getAgents(): Observable<Voice[]> {
    return this.getVoices();
  }
}
