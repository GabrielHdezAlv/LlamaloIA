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
  /** Agent ID si venimos de la pantalla de edición */
  agentId: string | null = null;
  /** Si venimos de la pantalla de admin */
  sourceAdmin: boolean = false;

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
    this.agentId = params['agentId'] || null;
    this.sourceAdmin = params['source'] === 'admin';
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
    if (this.agentId) {
      const targetRoute = this.sourceAdmin
        ? ['/admin/agents/edit', this.agentId]
        : ['/dashboard/agents/edit', this.agentId];

      this.router.navigate(targetRoute, {
        queryParams: {
          shopify: 'success',
          shop: this.shop || undefined,
          tab: 'connections'
        },
        queryParamsHandling: 'merge',
      });
    } else {
      const targetRoute = this.sourceAdmin ? ['/admin'] : ['/dashboard/agents/create'];
      this.router.navigate(targetRoute, {
        queryParams: {
          shopify: 'success',
          shop: this.shop || undefined,
          step: 'connectBusiness',
        },
        queryParamsHandling: '',
      });
    }
  }

  /**
   * Volver a crear/editar agente sin indicar éxito (para el caso de error).
   */
  goBack(): void {
    if (this.agentId) {
      const targetRoute = this.sourceAdmin
        ? ['/admin/agents/edit', this.agentId]
        : ['/dashboard/agents/edit', this.agentId];

      this.router.navigate(targetRoute, {
        queryParams: { tab: 'connections' }
      });
    } else {
      const targetRoute = this.sourceAdmin ? ['/admin'] : ['/dashboard/agents/create'];
      this.router.navigate(targetRoute);
    }
  }
}
