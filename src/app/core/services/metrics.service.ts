import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { DashboardMetrics } from '../../shared/models/dashboard-metrics.model';
import { TwilioDetailedMetrics } from '../../shared/models/twilio-detailed-metrics.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/metrics`;
  private baseUrl = environment.apiUrl;
  private isBrowser: boolean;
  
  // Observable para el estado de loading compartido
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Verifica la salud del sistema (backend)
   * @returns Observable con true si el sistema responde "pong", false en caso contrario
   */
  checkSystemHealth(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.http.get(`${this.baseUrl}/ping`, { responseType: 'text' }).subscribe({
        next: (response) => {
          subscriber.next(response === 'pong');
          subscriber.complete();
        },
        error: () => {
          subscriber.next(false);
          subscriber.complete();
        },
      });
    });
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

  /**
   * Obtiene las métricas del dashboard (últimos 7 días)
   * El endpoint siempre devuelve los últimos 7 días, no acepta parámetros
   * @returns Observable con las métricas del dashboard
   */
  getDashboardMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Obtiene métricas detalladas de Twilio
   * @param twilioAccountId Opcional: ID de la cuenta Twilio específica
   * @returns Observable con las métricas detalladas de Twilio
   */
  getTwilioDetailedMetrics(
    twilioAccountId?: string,
  ): Observable<TwilioDetailedMetrics> {
    let url = `${this.apiUrl}/twilio-detailed`;
    if (twilioAccountId) {
      url += `?twilioAccountId=${twilioAccountId}`;
    }

    return this.http.get<TwilioDetailedMetrics>(url, {
      headers: this.getAuthHeaders(),
    });
  }
}
