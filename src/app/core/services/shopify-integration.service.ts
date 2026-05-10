import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Operaciones de integración Shopify del usuario (cuenta global).
 * Desvincular tienda: el backend debe exponer el endpoint usado aquí.
 */
@Injectable({
  providedIn: 'root',
})
export class ShopifyIntegrationService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/shopify`;
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
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

  /** Desvincula una tienda del perfil del usuario (query `shop`). */
  disconnectStore(shopDomain: string): Observable<{ message?: string }> {
    const shop = shopDomain.trim();
    return this.http.delete<{ message?: string }>(`${this.baseUrl}/connection`, {
      headers: this.getAuthHeaders(),
      params: { shop },
    });
  }

  /** Catálogo / pedidos / tienda (para selectores de segmentación). */
  getMasterData(shop: string): Observable<{
    products?: Array<{ handle: string; title: string }>;
  }> {
    const s = shop.trim();
    return this.http.get<{
      products?: Array<{ handle: string; title: string }>;
    }>(`${this.baseUrl}/master-data`, {
      headers: this.getAuthHeaders(),
      params: { shop: s },
    });
  }
}
