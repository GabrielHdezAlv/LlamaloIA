import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { I18nService } from '../../core/services/i18n.service';
import { UserProfileResponseDto } from '../../shared/models/user-profile-response.dto';
import { environment } from '../../../environments/environment';

const BODY_CLASS = 'page-shopify-onboarding';
const MYSHOPIFY_SUFFIX = '.myshopify.com';
const API_URL = environment.apiUrl;

/** Respuesta del endpoint GET /shopify/auth */
interface ShopifyAuthResponse {
  authUrl: string;
  message?: string;
}

interface ConnectedShopifyStore {
  connected: boolean;
  shopDomain: string;
}

@Component({
  selector: 'app-shopify-onboarding',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './shopify-onboarding.component.html',
  styleUrl: './shopify-onboarding.component.scss',
})
export class ShopifyOnboardingComponent implements OnInit, OnDestroy {
  /** Valor del input "Dominio de Shopify". Debe terminar en .myshopify.com */
  shopifyDomain = '';
  /** Mientras se obtiene authUrl y se redirige al usuario */
  loading = false;
  /** Mientras se carga el perfil del usuario */
  loadingStores = true;
  /** Mensaje de error si falla la petición */
  errorMessage: string | null = null;
  /** Tiendas de Shopify conectadas del usuario */
  connectedStores: ConnectedShopifyStore[] = [];
  /** Indica si se debe mostrar el formulario de nueva tienda */
  showNewStoreForm = false;
  /** Tienda seleccionada si el usuario elige usar una existente */
  selectedStore: string | null = null;
  /** Agent ID si venimos de la pantalla de edición */
  agentId: string | null = null;
  /** Si venimos de la pantalla de admin */
  sourceAdmin: boolean = false;

  /** Si venimos del onboarding de empresa (company-setup) */
  sourceOnboarding: boolean = false;
  /** Si venimos de Ajustes → Conexiones (cuenta) */
  sourceAccount: boolean = false;

  private i18n = inject(I18nService);

  get t() {
    return this.i18n.getTranslations();
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService,
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
    
    // Capturar agentId de los query params
    this.agentId = this.route.snapshot.queryParams['agentId'] || null;
    this.sourceAdmin = this.route.snapshot.queryParams['source'] === 'admin';
    this.sourceOnboarding = this.route.snapshot.queryParams['source'] === 'onboarding';
    this.sourceAccount = this.route.snapshot.queryParams['source'] === 'account';

    this.loadConnectedStores();
  }

  /** Carga las tiendas de Shopify conectadas del usuario */
  loadConnectedStores(): void {
    this.loadingStores = true;
    firstValueFrom(this.userService.getUserProfile())
      .then((profile: UserProfileResponseDto) => {
        if (
          profile?.integrations?.shopify &&
          Array.isArray(profile.integrations.shopify)
        ) {
          this.connectedStores = profile.integrations.shopify
            .filter(
              (store) => store.connected === true && store.shopDomain,
            )
            .map((store) => ({
              connected: store.connected as boolean,
              shopDomain: store.shopDomain as string,
            }));
        }
        // Sincronizar estado visual:
        // - Si hay tiendas conectadas, NO mostrar el input de nueva tienda por defecto.
        // - Si no hay tiendas, sí mostrarlo.
        this.showNewStoreForm = this.connectedStores.length === 0;
      })
      .catch((error) => {
        console.error('Error al cargar tiendas conectadas:', error);
        // En caso de error, mostrar el formulario de nueva tienda
        this.showNewStoreForm = true;
      })
      .finally(() => {
        this.loadingStores = false;
      });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.classList.remove(BODY_CLASS);
    }
  }

  goBack(): void {
    // Si estamos en el formulario de nueva tienda y hay tiendas conectadas, volver a la vista de selección
    if (this.showNewStoreForm && this.connectedStores.length > 0) {
      this.showNewStoreForm = false;
      this.selectedStore = null;
      this.shopifyDomain = '';
      this.errorMessage = null;
      return;
    }
    // Si no hay tiendas conectadas o ya estamos en la vista de selección, navegar a la página anterior
    if (this.agentId) {
      if (this.sourceAdmin) {
        this.router.navigate(['/admin/agents/edit', this.agentId], { queryParams: { tab: 'connections' } });
      } else {
        this.router.navigate(['/dashboard/agents/edit', this.agentId], { queryParams: { tab: 'connections' } });
      }
    } else if (this.sourceOnboarding) {
      // No añadir shopify=success aquí: listar tiendas en cuenta ≠ OAuth completado en esta sesión.
      // El estado "Conectado" solo debe venir de /shopify-onboarding/success (continueConfiguringAgent).
      this.router.navigate(['/company-setup'], {
        queryParams: { step: 'connectBusiness' },
      });
    } else if (this.sourceAccount) {
      this.router.navigate(['/dashboard/account'], {
        queryParams: { tab: 'connections' },
      });
    } else {
      if (this.sourceAdmin) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dashboard/agents/create'], {
          queryParams: { step: 'connectBusiness' },
        });
      }
    }
  }

  /** Comprueba si el dominio tiene el formato correcto: *nombre.myshopify.com */
  get isDomainValid(): boolean {
    const trimmed = this.shopifyDomain.trim();
    if (!trimmed) return false;
    if (!trimmed.toLowerCase().endsWith(MYSHOPIFY_SUFFIX)) return false;
    const namePart = trimmed.slice(0, -MYSHOPIFY_SUFFIX.length).trim();
    return namePart.length > 0;
  }

  /** Usa una tienda ya conectada */
  useExistingStore(shopDomain: string): void {
    this.selectedStore = shopDomain;
    this.shopifyDomain = shopDomain;
    this.goToConnectShopify();
  }

  /** Muestra el formulario para conectar una nueva tienda */
  showNewStore(): void {
    this.showNewStoreForm = true;
    this.selectedStore = null;
    this.shopifyDomain = '';
  }

  goToConnectShopify(): void {
    // Si hay una tienda seleccionada, usar esa; si no, validar el dominio ingresado
    const shop = this.selectedStore || this.shopifyDomain.trim();
    
    if (!shop) {
      this.errorMessage = this.t.shopifyOnboardingErrorSelectOrDomain;
      return;
    }

    // Validar formato si no es una tienda seleccionada
    if (!this.selectedStore && !this.isDomainValid) {
      this.errorMessage = this.t.shopifyOnboardingErrorDomainSuffix;
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    let successPath = '/shopify-onboarding/success';
    const params = new URLSearchParams();
    if (this.agentId) {
      params.append('agentId', this.agentId);
    }
    if (this.sourceAdmin) {
      params.append('source', 'admin');
    }
    if (this.sourceOnboarding) {
      params.append('source', 'onboarding');
    }
    if (this.sourceAccount) {
      params.append('source', 'account');
    }

    if (params.toString()) {
      successPath += `?${params.toString()}`;
    }

    const returnTo =
      isPlatformBrowser(this.platformId) && typeof window !== 'undefined'
        ? `${window.location.origin}${successPath}`
        : '';
    const returnToParam = returnTo
      ? `&returnTo=${encodeURIComponent(returnTo)}`
      : '';
    const url = `${API_URL}/shopify/auth?shop=${encodeURIComponent(shop)}&redirect=false${returnToParam}`;
    firstValueFrom(
      this.http.get<ShopifyAuthResponse>(url, {
        headers: this.getAuthHeaders(),
      }),
    )
      .then((res) => {
        if (res?.authUrl) {
          if (isPlatformBrowser(this.platformId)) {
            window.location.href = res.authUrl;
            return;
          }
        }
        this.loading = false;
        if (!res?.authUrl) {
          this.errorMessage =
            res?.message || this.t.shopifyOnboardingErrorNoAuthUrl;
        }
      })
      .catch(() => {
        this.loading = false;
        this.errorMessage = this.t.shopifyOnboardingErrorServer;
      });
  }
}
