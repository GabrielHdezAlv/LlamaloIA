import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetrics, MetricsPeriod } from '../../shared/models/dashboard-metrics.model';

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://llamaloiabackend-5294.onrender.com/metrics';
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

  /**
   * Obtiene las métricas del dashboard
   * @param period Período de tiempo (opcional, default: 'week')
   * @returns Observable con las métricas del dashboard
   */
  getDashboardMetrics(period: MetricsPeriod = 'week'): Observable<DashboardMetrics> {
    const params = new HttpParams().set('period', period);
    
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }
}

