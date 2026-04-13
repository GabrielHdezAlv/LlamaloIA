import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  Inject,
  PLATFORM_ID,
  HostListener,
  ElementRef,
  effect,
  ChangeDetectorRef
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStorage } from '../../storages/user/user-storage';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  animate,
  AnimationEvent,
  group,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { I18nService, Language } from '../../core/services/i18n.service';
import { MetricsService } from '../../core/services/metrics.service';
import { NewsService } from '../../core/services/news.service';
import { USER_ROLE } from '../../shared/models/user-role.enum';
import { NewsItem } from '../../shared/models/news.model';
import { Subscription } from 'rxjs';
import { getAgentDraftStepLabel } from '../../shared/utils/agent-draft-step-labels';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { environment } from '../../../environments/environment';

export interface TranslatedNewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  link?: string;
}

const AGENT_DRAFT_KEY = 'llamalo_agent_draft';
/** Legacy key; ahora se usa por usuario en lastReadNewsStorageKey() */
const LEGACY_LAST_READ_NEWS_ID = 'lastReadNewsId';

interface AgentDraft {
  step: string;
  agentName: string;
  savedAt: number;
}

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  animations: [
    trigger('draftBanner', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translate(-50%, 20px)',
        }),
        animate(
          '420ms cubic-bezier(0.32, 0.72, 0, 1)',
          style({
            opacity: 1,
            transform: 'translate(-50%, 0)',
          }),
        ),
      ]),
      transition(':leave', [
        animate(
          '480ms cubic-bezier(0.36, 0, 0.2, 1)',
          style({
            opacity: 0,
            transform: 'translate(-50%, 20px)',
          }),
        ),
      ]),
    ]),
    trigger('newsModal', [
      transition(':enter', [
        style({ opacity: 0 }),
        group([
          animate(
            '260ms cubic-bezier(0.32, 0.72, 0, 1)',
            style({ opacity: 1 }),
          ),
          query(
            '.news-modal-shell',
            [
              style({
                opacity: 0,
                transform: 'scale(0.94) translateY(18px)',
              }),
              animate(
                '340ms cubic-bezier(0.22, 1, 0.36, 1)',
                style({
                  opacity: 1,
                  transform: 'scale(1) translateY(0)',
                }),
              ),
            ],
            { optional: true },
          ),
        ]),
      ]),
      transition(':leave', [
        group([
          animate(
            '220ms cubic-bezier(0.4, 0, 1, 1)',
            style({ opacity: 0 }),
          ),
          query(
            '.news-modal-shell',
            [
              animate(
                '220ms cubic-bezier(0.4, 0, 1, 1)',
                style({
                  opacity: 0,
                  transform: 'scale(0.96) translateY(12px)',
                }),
              ),
            ],
            { optional: true },
          ),
        ]),
      ]),
    ]),
  ],
})
export class TopbarComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Inicio';
  // Texto de bienvenida que se mostrará solo en la Home
  welcomeText: string = '';
  // Subtítulo/descripción de la página
  pageSubtitle: string = '';

  public router = inject(Router);
  public userStorage = inject(UserStorage);
  private authSession = inject(AuthSessionService);
  private isBrowser: boolean;
  private i18nService = inject(I18nService);
  private metricsService = inject(MetricsService);
  private newsService = inject(NewsService);

  newsList = this.newsService.getTranslatedNewsSignal;

  // Estado de loading para métricas
  isMetricsLoading: boolean = false;
  private metricsLoadingSubscription?: Subscription;

  // Getter para la URL actual
  get currentUrl(): string {
    return this.router.url;
  }

  // Modo oscuro
  isDarkMode = false;

  // Indica si estamos en la sección de admin
  isAdminSection = false;

  /** Etiqueta de entorno (Vercel / local); `null` en producción master. */
  readonly deployEnvLabel = environment.deployEnvLabel;

  showDropdown = false;
  dropdownClosing = false;
  dropdownOpening = false;
  showInviteModal = false;
  showNewsDropdown = false;
  newsDropdownClosing = false;
  newsDropdownOpening = false;
  hasNewNotifications = false;
  selectedNewsItem: TranslatedNewsItem | null = null;
  showNewsModal = false;
  showNewsScrollIndicator = false;
  private dropdownCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private newsDropdownCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private dropdownOpenTimer: ReturnType<typeof setTimeout> | null = null;
  private newsDropdownOpenTimer: ReturnType<typeof setTimeout> | null = null;

  // Draft recovery (visibilidad del banner; la navegación / borrado esperan al fin de la animación de salida)
  draftBannerShown = false;
  savedDraft: AgentDraft | null = null;
  private draftBannerClosingForUserAction = false;
  private pendingNavigateToCreateFromBanner = false;
  private pendingDiscardDraftAfterBannerClose = false;
  private draftBannerActionFallbackTimer: ReturnType<typeof setTimeout> | null =
    null;

  // Variables para el modal de invitación
  emailInput: string = '';
  selectedEmails: string[] = [];
  selectedRole: string = 'Can Edit';
  showSuggestions: boolean = false;
  hoveredSuggestionIndex: number = -1;
  openDropdownMember: string | null = null;

  // Lista de miembros actuales del equipo
  teamMembers: any[] = [];

  // Sugerencias de contactos
  contactSuggestions: any[] = [
    {
      name: 'Sebastian Graham',
      email: 'sebastian.graham@example.com',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Sara Cruz',
      email: 'sara.cruz@example.com',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'David Brown',
      email: 'david.brown@example.com',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'James Taylor',
      email: 'james.taylor@example.com',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Robert Martinez',
      email: 'robert.martinez@example.com',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    },
    {
      name: 'Jennifer Davis',
      email: 'jennifer.davis@example.com',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face',
    },
  ];

  // Roles disponibles
  roles = ['Can Edit', 'Can View', 'Can Comment'];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      effect(() => {
        this.userStorage.user();
        const news = this.newsList() ?? [];
        this.syncNotificationBadgeFromStorage(news);
      });
    }
  }

  /** Key por usuario para que cambiar de cuenta no mezcle “leído” */
  private lastReadNewsStorageKey(): string {
    const uid = this.userStorage.user()?.userId;
    return uid
      ? `llamalo_lastReadNewsId_${uid}`
      : 'llamalo_lastReadNewsId_guest';
  }

  private getLastReadNewsIdFromStorage(): string | null {
    if (!this.isBrowser) return null;
    const key = this.lastReadNewsStorageKey();
    let v = localStorage.getItem(key);
    if (!v && key !== LEGACY_LAST_READ_NEWS_ID) {
      const legacy = localStorage.getItem(LEGACY_LAST_READ_NEWS_ID);
      if (legacy) {
        localStorage.setItem(key, legacy);
        v = legacy;
      }
    }
    if (!v && key.startsWith('llamalo_lastReadNewsId_') && !key.endsWith('_guest')) {
      const guest = localStorage.getItem('llamalo_lastReadNewsId_guest');
      if (guest) {
        localStorage.setItem(key, guest);
        v = guest;
      }
    }
    return v;
  }

  /**
   * Indicador rojo: solo si la noticia más reciente del listado es distinta
   * de la última marcada como vista en localStorage.
   */
  private syncNotificationBadgeFromStorage(news: TranslatedNewsItem[]): void {
    if (!this.isBrowser) return;
    if (!news || news.length === 0) {
      this.hasNewNotifications = false;
      return;
    }
    const latestNewsId = news[0].id;
    const lastRead = this.getLastReadNewsIdFromStorage();
    this.hasNewNotifications = lastRead !== latestNewsId;
  }

  /** Persiste que el usuario ya vio el listado actual (popup abierto o detalle). */
  private markCurrentNewsAsSeen(): void {
    if (!this.isBrowser) return;
    const news = this.newsList();
    if (!news || news.length === 0) return;
    const latestId = news[0].id;
    localStorage.setItem(this.lastReadNewsStorageKey(), latestId);
    this.hasNewNotifications = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Cerrar dropdown si se hace clic fuera de él
    if (this.showDropdown) {
      const host = this.elementRef.nativeElement as HTMLElement;
      const desktopDropdown = host.querySelector(
        '.topbar-dropdown',
      ) as HTMLElement | null;
      const desktopAvatar = host.querySelector(
        '.topbar-avatar',
      ) as HTMLElement | null;
      const mobileDropdown = host.querySelector(
        '.mobile-topbar-dropdown',
      ) as HTMLElement | null;
      const mobileAvatar = host.querySelector(
        '.mobile-topbar-avatar',
      ) as HTMLElement | null;
      const target = event.target as HTMLElement;

      if (
        !(
          (desktopDropdown && desktopDropdown.contains(target)) ||
          (desktopAvatar && desktopAvatar.contains(target)) ||
          (mobileDropdown && mobileDropdown.contains(target)) ||
          (mobileAvatar && mobileAvatar.contains(target))
        )
      ) {
        this.closeDropdownWithAnimation();
      }
    }

    // Cerrar dropdown de noticias si se hace clic fuera
    if (this.showNewsDropdown && !this.showNewsModal) {
      const host = this.elementRef.nativeElement as HTMLElement;
      const newsButtons = host.querySelectorAll('.news-bell-btn');
      const newsDropdowns = host.querySelectorAll('.news-dropdown');
      const target = event.target as HTMLElement;

      let clickedInside = false;
      newsButtons.forEach((btn) => {
        if (btn.contains(target)) clickedInside = true;
      });
      newsDropdowns.forEach((dropdown) => {
        if (dropdown.contains(target)) clickedInside = true;
      });

      if (!clickedInside) {
        this.closeNewsDropdownWithAnimation();
      }
    }
  }

  closeDropdownWithAnimation() {
    if (!this.showDropdown || this.dropdownClosing) return;
    this.dropdownClosing = true;
    if (this.dropdownCloseTimer) clearTimeout(this.dropdownCloseTimer);
    this.dropdownCloseTimer = setTimeout(() => {
      this.showDropdown = false;
      this.dropdownClosing = false;
      this.dropdownCloseTimer = null;
    }, 220);
  }

  closeNewsDropdownWithAnimation() {
    if (!this.showNewsDropdown || this.newsDropdownClosing) return;
    this.newsDropdownClosing = true;
    if (this.newsDropdownCloseTimer) clearTimeout(this.newsDropdownCloseTimer);
    this.newsDropdownCloseTimer = setTimeout(() => {
      this.showNewsDropdown = false;
      this.newsDropdownClosing = false;
      this.newsDropdownCloseTimer = null;
    }, 220);
  }

  // Idiomas usando el servicio de i18n
  languages = this.i18nService.getAvailableLanguages();

  // Obtener el idioma seleccionado usando el método del servicio
  get selectedLanguage() {
    return this.i18nService.selectedLanguage();
  }

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  userName = () => {
    const user = this.userStorage.user();
    return user ? `${user.name} ${user.lastname}` : 'Usuario';
  };

  getUserProfileImage = () => {
    const user = this.userStorage.user();
    return user?.profileImage || 'assets/predeterminada.webp';
  };

  formatNewsDate(date: string): string {
    return this.newsService.getRelativeDateLabel(date);
  }

  /** Clases Tailwind para la pastilla de entorno (topbar derecha). */
  deployEnvBadgeClass(): string {
    const l = this.deployEnvLabel;
    if (!l) {
      return '';
    }
    const base =
      'inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide shrink-0';
    if (l === 'preprod') {
      return `${base} border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200`;
    }
    if (l === 'dev') {
      return `${base} border-sky-500/40 bg-sky-500/10 text-sky-900 dark:text-sky-200`;
    }
    if (l === 'new-dev') {
      return `${base} border-violet-500/40 bg-violet-500/10 text-violet-900 dark:text-violet-200`;
    }
    return `${base} border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300`;
  }

  ngOnInit() {
    this.i18nService.initializeLanguage();

    // Inicializar modo oscuro desde localStorage / preferencia del sistema
    if (this.isBrowser) {
      const stored = localStorage.getItem('llamalo-theme');
      if (stored === 'dark') {
        this.setDarkMode(true, false);
      } else if (stored === 'light') {
        this.setDarkMode(false, false);
      } else {
        const prefersDark = window.matchMedia?.(
          '(prefers-color-scheme: dark)',
        ).matches;
        this.setDarkMode(prefersDark, false);
      }
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeader();
        this.checkForSavedDraft();
      });

    this.updateHeader();
    this.initializeTeamMembers();
    this.checkForSavedDraft();

    // Suscribirse al estado de loading de métricas
    this.metricsLoadingSubscription = this.metricsService.loading$.subscribe(
      (loading) => {
        this.isMetricsLoading = loading;
      },
    );
  }

  ngOnDestroy() {
    if (this.metricsLoadingSubscription) {
      this.metricsLoadingSubscription.unsubscribe();
    }
    if (this.dropdownCloseTimer) clearTimeout(this.dropdownCloseTimer);
    if (this.newsDropdownCloseTimer) clearTimeout(this.newsDropdownCloseTimer);
    if (this.dropdownOpenTimer) clearTimeout(this.dropdownOpenTimer);
    if (this.newsDropdownOpenTimer) clearTimeout(this.newsDropdownOpenTimer);
    this.clearDraftBannerActionFallback();
  }

  checkForSavedDraft() {
    if (!this.isBrowser) return;

    // No mostrar el banner si ya estamos en la página de crear agentes
    if (this.router.url === '/dashboard/agents/create') {
      this.draftBannerShown = false;
      this.draftBannerClosingForUserAction = false;
      return;
    }

    if (this.draftBannerClosingForUserAction) {
      return;
    }

    const savedData = localStorage.getItem(AGENT_DRAFT_KEY);
    if (savedData) {
      try {
        this.savedDraft = JSON.parse(savedData);
        // Borrador de flujo ya completado: no mostrar banner (y limpiar datos viejos)
        if (this.savedDraft?.step === 'success') {
          localStorage.removeItem(AGENT_DRAFT_KEY);
          this.savedDraft = null;
          this.draftBannerShown = false;
          return;
        }
        // Solo mostrar si hay algo significativo guardado
        if (
          this.savedDraft &&
          (this.savedDraft.step !== 'agentName' || this.savedDraft.agentName)
        ) {
          this.draftBannerShown = true;
        } else {
          this.draftBannerShown = false;
        }
      } catch (e) {
        this.draftBannerShown = false;
      }
    } else {
      this.draftBannerShown = false;
    }
  }

  goToRecoverDraft() {
    this.draftBannerClosingForUserAction = true;
    this.pendingNavigateToCreateFromBanner = true;
    this.draftBannerShown = false;
    this.scheduleDraftBannerActionFallback();
  }

  discardDraft() {
    this.draftBannerClosingForUserAction = true;
    this.pendingDiscardDraftAfterBannerClose = true;
    this.draftBannerShown = false;
    this.scheduleDraftBannerActionFallback();
  }

  onDraftBannerAnimDone(event: AnimationEvent): void {
    if (event.phaseName !== 'done' || event.toState !== 'void') {
      return;
    }
    if (
      !this.pendingNavigateToCreateFromBanner &&
      !this.pendingDiscardDraftAfterBannerClose
    ) {
      return;
    }
    this.flushDraftBannerPendingActions();
  }

  private scheduleDraftBannerActionFallback(): void {
    this.clearDraftBannerActionFallback();
    this.draftBannerActionFallbackTimer = setTimeout(() => {
      this.draftBannerActionFallbackTimer = null;
      if (
        this.pendingNavigateToCreateFromBanner ||
        this.pendingDiscardDraftAfterBannerClose
      ) {
        this.flushDraftBannerPendingActions();
      }
    }, 650);
  }

  private clearDraftBannerActionFallback(): void {
    if (this.draftBannerActionFallbackTimer) {
      clearTimeout(this.draftBannerActionFallbackTimer);
      this.draftBannerActionFallbackTimer = null;
    }
  }

  private flushDraftBannerPendingActions(): void {
    this.clearDraftBannerActionFallback();
    if (this.pendingNavigateToCreateFromBanner) {
      this.pendingNavigateToCreateFromBanner = false;
      this.draftBannerClosingForUserAction = false;
      this.router.navigate(['/dashboard/agents/create']);
      return;
    }
    if (this.pendingDiscardDraftAfterBannerClose) {
      this.pendingDiscardDraftAfterBannerClose = false;
      this.draftBannerClosingForUserAction = false;
      if (this.isBrowser) {
        localStorage.removeItem(AGENT_DRAFT_KEY);
      }
      this.savedDraft = null;
    }
  }

  getSavedStepText(): string {
    if (!this.savedDraft) return '';
    return getAgentDraftStepLabel(
      this.savedDraft.step,
      this.i18nService.selectedLanguage().code,
    );
  }

  toggleDarkMode() {
    this.setDarkMode(!this.isDarkMode, true);
  }

  private setDarkMode(enabled: boolean, persist: boolean) {
    this.isDarkMode = enabled;
    if (!this.isBrowser) return;

    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (persist) {
      localStorage.setItem('llamalo-theme', enabled ? 'dark' : 'light');
    }
  }

  initializeTeamMembers() {
    const user = this.userStorage.user();
    if (user) {
      this.teamMembers = [
        {
          name: `${user.name} ${user.lastname}`,
          email: user.email,
          role: user.rol === USER_ROLE.OWNER ? 'Owner' : 'Client User',
          status: 'Accepted',
          avatar:
            user.profileImage ||
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        },
      ];
    }
  }

  updateHeader() {
    const url = this.router.url;
    const t = this.i18nService.getTranslations();
    const langCode = this.i18nService.selectedLanguage().code;

    // Detectar si estamos en la sección de admin
    this.isAdminSection = url.startsWith('/admin');

    // Rutas de admin
    if (url.startsWith('/admin/tokens')) {
      this.pageTitle =
        langCode === 'en' ? 'External services' : 'Servicios Externos';
      this.welcomeText = '';
      this.pageSubtitle =
        langCode === 'en'
          ? 'Manage and view API tokens for integrated services'
          : 'Gestiona y visualiza los tokens de API de los servicios integrados';
    } else if (url.startsWith('/admin/redes-sociales')) {
      this.pageTitle =
        langCode === 'en' ? 'Social networks' : 'Redes Sociales';
      this.welcomeText = '';
      this.pageSubtitle =
        langCode === 'en'
          ? 'Manage and view your social media metrics'
          : 'Gestiona y visualiza las métricas de tus redes sociales';
    } else if (url.startsWith('/admin/gasto')) {
      this.pageTitle =
        langCode === 'en' ? 'Services spending' : 'Gasto de Servicios';
      this.welcomeText = '';
      this.pageSubtitle =
        langCode === 'en'
          ? 'Manage and view spending for integrated services'
          : 'Gestiona y visualiza el gasto de los servicios integrados';
    } else if (url.startsWith('/admin/metrics')) {
      this.pageTitle = t.metrics;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/admin/home') || url === '/admin') {
      this.pageTitle =
        langCode === 'en' ? 'General information' : 'Información General';
      this.welcomeText = '';
      this.pageSubtitle =
        langCode === 'en'
          ? 'Overview of the system and admin metrics'
          : 'Vista general del sistema y métricas administrativas';
    } else if (url.startsWith('/admin/agents/edit/')) {
      this.pageTitle =
        langCode === 'en' ? 'Xenon settings' : 'Configuración Xenon';
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url === '/admin/news') {
      this.pageTitle =
        langCode === 'en' ? 'Manage news' : 'Gestionar Noticias';
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url === '/dashboard/agents/create') {
      this.pageTitle = t.createAgent;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/agents/edit/')) {
      this.pageTitle = langCode === 'en' ? 'Edit agent' : 'Edición de Agente';
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/agents')) {
      this.pageTitle = t.agents;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/numbers')) {
      this.pageTitle = t.numbers;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/history')) {
      this.pageTitle = t.history;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/metrics')) {
      this.pageTitle = t.metrics;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/knowledge-base')) {
      this.pageTitle = t.knowledgeBase;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url === '/dashboard/profile') {
      // No hay clave específica de perfil; usar ajustes como equivalente
      this.pageTitle = t.settings;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url === '/dashboard/account') {
      this.pageTitle = t.settings;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else {
      // Home
      this.pageTitle = t.home;
      this.pageSubtitle = '';
      this.welcomeText = '';
    }
  }

  toggleDropdown() {
    if (this.showDropdown) {
      this.closeDropdownWithAnimation();
    } else {
      this.showNewsDropdown = false;
      this.newsDropdownClosing = false;
      this.showDropdown = true;
      this.dropdownClosing = false;
      this.dropdownOpening = true;
      if (this.dropdownOpenTimer) clearTimeout(this.dropdownOpenTimer);
      this.dropdownOpenTimer = setTimeout(() => {
        this.dropdownOpening = false;
        this.dropdownOpenTimer = null;
      }, 20);
    }
  }

  selectLanguage(lang: Language) {
    this.i18nService.setLanguage(lang);
    this.updateHeader();
  }

  navigateTo(route: string) {
    if (route === '/dashboard/community') {
      window.open('https://t.me/+wDgRI51qiW1mZjdk', '_blank');
    } else {
      this.router.navigate([route]);
    }
    this.closeDropdownWithAnimation();
  }

  logout() {
    this.authSession.signOutAndReload();
  }

  goToGifts() {
    this.router.navigate(['/dashboard/account'], {
      queryParams: { tab: 'gifts' },
    });
    this.closeDropdownWithAnimation();
  }

  openInviteModal() {
    this.showInviteModal = true;
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  // Métodos del modal de invitación
  onEmailInputChange() {
    this.showSuggestions = this.emailInput.length > 0;
  }

  onEmailKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addEmail();
    }
  }

  addEmail() {
    const name = this.emailInput.trim();
    if (name && !this.selectedEmails.includes(name)) {
      this.selectedEmails.push(name);
      this.emailInput = '';
      this.showSuggestions = false;
    }
  }

  removeEmail(name: string) {
    this.selectedEmails = this.selectedEmails.filter((e) => e !== name);
  }

  selectSuggestion(suggestion: any) {
    const name = suggestion.name;
    if (!this.selectedEmails.includes(name)) {
      this.selectedEmails.push(name);
      this.emailInput = '';
      this.showSuggestions = false;
    }
  }

  toggleMemberRole(member: any) {
    // Abrir/cerrar el dropdown para este miembro específico
    this.openDropdownMember =
      this.openDropdownMember === member.name ? null : member.name;
  }

  updateMemberRole(member: any, newRole: string) {
    member.role = newRole;
    this.openDropdownMember = null; // Cerrar el dropdown después de seleccionar
  }

  closeMemberDropdown() {
    this.openDropdownMember = null;
  }

  cancelInvite(member: any) {
    this.teamMembers = this.teamMembers.filter((m) => m !== member);
  }

  sendInvite() {
    // Incluir el valor actual del input si aún no se ha añadido
    if (this.emailInput && this.emailInput.trim()) {
      this.addEmail();
    }

    if (this.selectedEmails.length === 0) {
      return;
    }

    // Añadir los nuevos miembros a la lista (por defecto: Pending)
    this.selectedEmails.forEach((email) => {
      const newMember = {
        name: email,
        email: email,
        role: this.selectedRole,
        status: 'Pending', // Otros posibles estados: 'Accepted', 'Rejected'
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', // Avatar por defecto
      };
      this.teamMembers.push(newMember);
    });

    // Limpiar el formulario después de enviar
    this.selectedEmails = [];
    this.emailInput = '';
    this.selectedRole = 'Can Edit';
    this.showSuggestions = false;

    // Hacer scroll hacia abajo para mostrar los nuevos miembros
    setTimeout(() => {
      const teamMembersContainer = document.querySelector(
        '.team-members-container',
      );
      if (teamMembersContainer) {
        teamMembersContainer.scrollTop = teamMembersContainer.scrollHeight;
      }
    }, 100);
  }

  copyInviteLink() {
    const inviteLink = 'https://llamalo.ai'; // TODO: enlazar con URL real de invitación
    if (this.isBrowser && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink).catch((err) => {
        console.error('Error copying link', err);
      });
    }
  }

  shareInviteOnTwitter() {
    const inviteLink = 'https://llamalo.ai';
    if (this.isBrowser) {
      const text = encodeURIComponent(
        'Únete a Llamalo AI y consigue minutos extra.',
      );
      const url = encodeURIComponent(inviteLink);
      const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      window.open(shareUrl, '_blank');
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeInviteModal();
    }
  }

  toggleNewsDropdown() {
    if (this.showNewsDropdown) {
      this.closeNewsDropdownWithAnimation();
    } else {
      this.showDropdown = false;
      this.dropdownClosing = false;
      this.showNewsDropdown = true;
      this.newsDropdownClosing = false;
      this.newsDropdownOpening = true;
      this.markCurrentNewsAsSeen();
      this.closeDropdownWithAnimation();
      if (this.newsDropdownOpenTimer) clearTimeout(this.newsDropdownOpenTimer);
      this.newsDropdownOpenTimer = setTimeout(() => {
        this.newsDropdownOpening = false;
        this.newsDropdownOpenTimer = null;
      }, 20);
    }
  }

  closeNewsDropdown() {
    this.showNewsDropdown = false;
  }

  private cdr = inject(ChangeDetectorRef);

  // Compatibilidad con referencias antiguas si las hubiera
  openNewsModal(news?: TranslatedNewsItem) {
    if (news) {
      this.markCurrentNewsAsSeen();
      this.selectedNewsItem = news;
      this.showNewsModal = true;
      this.closeNewsDropdownWithAnimation();
      
      // Forzar la actualización para asegurarse de que Angular renderice el modal
      if (this.cdr) {
        this.cdr.detectChanges();
      }
      
      // Check if scroll indicator is needed after a short delay for rendering
      setTimeout(() => {
        this.checkNewsScroll();
      }, 50);
    } else {
      this.toggleNewsDropdown();
    }
  }

  checkNewsScroll(event?: Event) {
    const container = event?.target as HTMLElement;
    if (container) {
      // Calculate if we've reached the bottom (with a 5px tolerance)
      const isAtBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) <= 5;
      this.showNewsScrollIndicator = !isAtBottom && container.scrollHeight > container.clientHeight;
    } else {
      // Find the container by class when it's just opening
      const modalContainer = document.querySelector('.news-modal-scroll-container');
      if (modalContainer) {
        this.showNewsScrollIndicator = modalContainer.scrollHeight > modalContainer.clientHeight;
      }
    }
  }

  closeNewsItemModal() {
    this.showNewsModal = false;
    this.selectedNewsItem = null;
    this.showNewsScrollIndicator = false;
    
    if (this.cdr) {
      this.cdr.detectChanges();
    }
  }

  // Abrir sidebar móvil
  openMobileSidebar() {
    // Disparar evento personalizado para abrir el sidebar móvil
    if (this.isBrowser) {
      const event = new CustomEvent('openMobileSidebar');
      window.dispatchEvent(event);
    }
  }
}
