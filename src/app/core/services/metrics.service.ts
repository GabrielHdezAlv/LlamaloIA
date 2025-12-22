import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetrics } from '../../shared/models/dashboard-metrics.model';

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
      
      // Logs de depuración (sin exponer el token completo)
      if (!token) {
        console.warn('⚠️ No se encontró token en localStorage');
      } else {
        console.log('✅ Token encontrado, longitud:', token.length, 'Primeros caracteres:', token.substring(0, 20) + '...');
      }
    } else {
      console.warn('⚠️ No estamos en el navegador, no se puede obtener el token');
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
}

