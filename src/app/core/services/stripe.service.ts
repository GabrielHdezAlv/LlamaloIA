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
    /** Anual: enviar `year` (API usa STRIPE_PRICE_*_ANNUAL). */
    billingInterval?: 'month' | 'year';
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

  /** Cambio de plan o periodo (mensual/anual) sobre la suscripción Stripe existente. */
  changeSubscriptionPlan(body: {
    plan: StripePaidPlan;
    billingInterval?: 'month' | 'year';
  }): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(
      `${this.stripeBase()}/subscription/change-plan`,
      body,
      { headers: this.getAuthHeaders() },
    );
  }

  /** Enlaces a la factura pagada más reciente (PDF o página alojada en Stripe). */
  /**
   * Onboarding: 7 días gratis sin tarjeta — registra Customer en Stripe (y suscripción €0 si está configurada).
   */
  registerOnboardingFreeTrial(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.stripeBase()}/onboarding-free-trial`,
      {},
      { headers: this.getAuthHeaders() },
    );
  }

  getLatestInvoice(): Observable<{
    pdfUrl: string | null;
    hostedInvoiceUrl: string | null;
    invoiceNumber: string | null;
    invoiceId: string | null;
  }> {
    return this.http.get<{
      pdfUrl: string | null;
      hostedInvoiceUrl: string | null;
      invoiceNumber: string | null;
      invoiceId: string | null;
    }>(`${this.stripeBase()}/latest-invoice`, { headers: this.getAuthHeaders() });
  }
}
