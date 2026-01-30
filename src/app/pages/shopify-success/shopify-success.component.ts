import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

const BODY_CLASS = 'page-shopify-success';

@Component({
  selector: 'app-shopify-success',
  standalone: true,
  imports: [],
  templateUrl: './shopify-success.component.html',
  styleUrl: './shopify-success.component.scss',
})
export class ShopifySuccessComponent implements OnInit, OnDestroy {
  /** shop recibido en la redirección de Shopify */
  shop = '';
  /** true si la redirección indica error */
  isError = false;
  /** Código de error si aplica */
  errorCode = '';
  /** Mensaje de error si aplica */
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add(BODY_CLASS);
      document.documentElement.classList.add(BODY_CLASS);
    }
    const params = this.route.snapshot.queryParams;
    this.shop = params['shop'] ?? '';
    this.isError = (params['shopify'] ?? '').toLowerCase() === 'error';
    this.errorCode = params['code'] ?? '';
    this.errorMessage = params['message'] ?? '';
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.classList.remove(BODY_CLASS);
    }
  }

  /**
   * Misma funcionalidad que "Volver" de la página de conecta Shopify:
   * navega a crear agente. Además envía query params indicando que la conexión
   * con Shopify fue exitosa para que la página de crear agente muestre el modal.
   */
  continueConfiguringAgent(): void {
    this.router.navigate(['/dashboard/agents/create'], {
      queryParams: {
        shopify: 'success',
        shop: this.shop || undefined,
        step: 'connectBusiness',
      },
      queryParamsHandling: '',
    });
  }

  /**
   * Volver a crear agente sin indicar éxito (para el caso de error).
   */
  goBack(): void {
    this.router.navigate(['/dashboard/agents/create']);
  }
}
