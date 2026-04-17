import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { X_HANDLES_PLAN_403 } from '../http/plan-403.headers';

export interface WebhookAction {
  id: string;
  agentId: number;
  name: string;
  description: string;
  webhookUrl: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WebhookActionsService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private plan403Headers(): HttpHeaders {
    return this.getAuthHeaders().set(X_HANDLES_PLAN_403, '1');
  }

  list(agentId: number): Observable<{ items: WebhookAction[] }> {
    return this.http.get<{ items: WebhookAction[] }>(
      `${this.baseUrl}/agents/${agentId}/webhook-actions`,
      { headers: this.plan403Headers() },
    );
  }

  create(
    agentId: number,
    body: { name: string; description: string; webhookUrl: string },
  ): Observable<{ action: WebhookAction }> {
    return this.http.post<{ action: WebhookAction }>(
      `${this.baseUrl}/agents/${agentId}/webhook-actions`,
      body,
      { headers: this.plan403Headers() },
    );
  }

  update(
    agentId: number,
    actionId: string,
    body: { name: string; description: string; webhookUrl: string },
  ): Observable<{ action: WebhookAction }> {
    return this.http.patch<{ action: WebhookAction }>(
      `${this.baseUrl}/agents/${agentId}/webhook-actions/${actionId}`,
      body,
      { headers: this.plan403Headers() },
    );
  }

  delete(agentId: number, actionId: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(
      `${this.baseUrl}/agents/${agentId}/webhook-actions/${actionId}`,
      { headers: this.plan403Headers() },
    );
  }
}
