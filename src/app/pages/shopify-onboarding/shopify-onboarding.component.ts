import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

const BODY_CLASS = 'page-shopify-onboarding';
const MYSHOPIFY_SUFFIX = '.myshopify.com';
const API_URL = 'https://llamaloiabackend-5294.onrender.com';

/** Respuesta del endpoint GET /shopify/auth */
interface ShopifyAuthResponse {
  authUrl: string;
  message?: string;
}

@Component({
  selector: 'app-shopify-onboarding',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './shopify-onboarding.component.html',
  styleUrl: './shopify-onboarding.component.scss',
})
export class ShopifyOnboardingComponent implements OnInit, OnDestroy {
  /** Valor del input "Dominio de Shopify". Debe terminar en .myshopify.com */
  shopifyDomain = '';
  /** Mientras se obtiene authUrl y se redirige al usuario */
  loading = false;
  /** Mensaje de error si falla la petición */
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = window.localStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add(BODY_CLASS);
      document.documentElement.classList.add(BODY_CLASS);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.classList.remove(BODY_CLASS);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/agents/create']);
  }

  /** Comprueba si el dominio tiene el formato correcto: *nombre.myshopify.com */
  get isDomainValid(): boolean {
    const trimmed = this.shopifyDomain.trim();
    if (!trimmed) return false;
    if (!trimmed.toLowerCase().endsWith(MYSHOPIFY_SUFFIX)) return false;
    const namePart = trimmed.slice(0, -MYSHOPIFY_SUFFIX.length).trim();
    return namePart.length > 0;
  }

  goToConnectShopify(): void {
    if (!this.isDomainValid) return;
    const shop = this.shopifyDomain.trim();
    this.loading = true;
    this.errorMessage = null;

    const url = `${API_URL}/shopify/auth?shop=${encodeURIComponent(shop)}&redirect=false`;
    firstValueFrom(
      this.http.get<ShopifyAuthResponse>(url, {
        headers: this.getAuthHeaders(),
      }),
    )
      .then((res) => {
        if (res?.authUrl) {
          if (isPlatformBrowser(this.platformId) && window.open) {
            window.open(res.authUrl, '_blank', 'noopener,noreferrer');
          }
        }
        this.loading = false;
        if (!res?.authUrl) {
          this.errorMessage =
            res?.message || 'No se recibió la URL de autorización.';
        }
      })
      .catch(() => {
        this.loading = false;
        this.errorMessage =
          'No se pudo conectar con el servidor. Inténtalo de nuevo.';
      });
  }
}
