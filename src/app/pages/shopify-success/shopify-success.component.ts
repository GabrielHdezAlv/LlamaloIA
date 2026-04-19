import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  afterNextRender,
  isDevMode,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { UserStorage } from '../../storages/user/user-storage';

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
  /** Si venimos del onboarding de empresa (company-setup) */
  sourceOnboarding: boolean = false;
  /** Si venimos de Ajustes → Conexiones */
  sourceAccount: boolean = false;

  private userStorage = inject(UserStorage);
  private i18n = inject(I18nService);

  get t() {
    return this.i18n.getTranslations();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    afterNextRender(() => {
      if (this.isError) {
        return;
      }
      void this.userStorage
        .loadUserProfile()
        .then(() => {
          if (isDevMode()) {
            console.log(
              '✅ Perfil de usuario recargado tras conexión Shopify exitosa.',
            );
          }
        })
        .catch((err: unknown) => {
          console.error(
            'Error al recargar el perfil de usuario tras conexión Shopify:',
            err,
          );
        });
    });
  }

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
    this.sourceOnboarding = params['source'] === 'onboarding';
    this.sourceAccount = params['source'] === 'account';
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.classList.remove(BODY_CLASS);
    }
  }

  /**
   * Vuelve al paso "Conecta tu negocio de Shopify" del onboarding con estado conectado
   * (mismos query params que "Continuar configurando el agente").
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
    } else if (this.sourceOnboarding) {
      this.router.navigate(['/company-setup'], {
        queryParams: {
          shopify: 'success',
          shop: this.shop || undefined,
          step: 'connectBusiness',
        },
        queryParamsHandling: '',
      });
    } else if (this.sourceAccount) {
      this.router.navigate(['/dashboard/account'], {
        queryParams: {
          shopify: 'success',
          shop: this.shop || undefined,
          tab: 'connections',
        },
        queryParamsHandling: '',
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
   * Volver tras error: mismo paso de onboarding sin forzar éxito de Shopify.
   */
  goBack(): void {
    if (this.agentId) {
      const targetRoute = this.sourceAdmin
        ? ['/admin/agents/edit', this.agentId]
        : ['/dashboard/agents/edit', this.agentId];

      this.router.navigate(targetRoute, {
        queryParams: { tab: 'connections' }
      });
    } else if (this.sourceOnboarding) {
      this.router.navigate(['/company-setup'], {
        queryParams: { step: 'connectBusiness' },
        queryParamsHandling: '',
      });
    } else if (this.sourceAccount) {
      this.router.navigate(['/dashboard/account'], {
        queryParams: { tab: 'connections' },
        queryParamsHandling: '',
      });
    } else {
      if (this.sourceAdmin) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard/agents/create'], {
          queryParams: { step: 'connectBusiness' },
          queryParamsHandling: '',
        });
      }
    }
  }
}
