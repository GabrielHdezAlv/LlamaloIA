import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

export type StripePaidPlan = 'starter' | 'growth' | 'scale';
export type StarterCheckoutMode = 'trial' | 'pay';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  private stripeBase(): string {
    return `${this.userService.getApiBaseUrl()}/stripe`;
  }

  createCheckoutSession(body: {
    plan: StripePaidPlan;
    successUrl: string;
    cancelUrl: string;
    starterMode?: StarterCheckoutMode;
  }): Observable<{ url: string | null; sessionId: string }> {
    return this.http.post<{ url: string | null; sessionId: string }>(
      `${this.stripeBase()}/checkout-session`,
      body,
      { headers: this.getAuthHeaders() },
    );
  }

  createBillingPortalSession(body: {
    returnUrl: string;
  }): Observable<{ url: string | null }> {
    return this.http.post<{ url: string | null }>(
      `${this.stripeBase()}/billing-portal`,
      body,
      { headers: this.getAuthHeaders() },
    );
  }
}
