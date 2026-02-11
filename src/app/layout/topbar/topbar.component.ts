import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  Inject,
  PLATFORM_ID,
  HostListener,
  ElementRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStorage } from '../../storages/user/user-storage';
import { NgIf, NgFor, NgClass, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, Language } from '../../core/services/i18n.service';
import { MetricsService } from '../../core/services/metrics.service';
import { USER_ROLE } from '../../shared/models/user-role.enum';
import { Subscription } from 'rxjs';

const AGENT_DRAFT_KEY = 'llamalo_agent_draft';

interface AgentDraft {
  step: string;
  agentName: string;
  savedAt: number;
}

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Inicio';
  // Texto de bienvenida que se mostrará solo en la Home
  welcomeText: string = '';
  // Subtítulo/descripción de la página
  pageSubtitle: string = '';

  public router = inject(Router);
  public userStorage = inject(UserStorage);
  private isBrowser: boolean;
  private i18nService = inject(I18nService);
  private metricsService = inject(MetricsService);

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

  showDropdown = false;
  showInviteModal = false;

  // Draft recovery
  hasSavedDraft = false;
  savedDraft: AgentDraft | null = null;

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
        this.showDropdown = false;
      }
    }
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
  }

  checkForSavedDraft() {
    if (!this.isBrowser) return;

    // No mostrar el banner si ya estamos en la página de crear agentes
    if (this.router.url === '/dashboard/agents/create') {
      this.hasSavedDraft = false;
      return;
    }

    const savedData = localStorage.getItem(AGENT_DRAFT_KEY);
    if (savedData) {
      try {
        this.savedDraft = JSON.parse(savedData);
        // Solo mostrar si hay algo significativo guardado
        if (
          this.savedDraft &&
          (this.savedDraft.step !== 'agentName' || this.savedDraft.agentName)
        ) {
          this.hasSavedDraft = true;
        } else {
          this.hasSavedDraft = false;
        }
      } catch (e) {
        this.hasSavedDraft = false;
      }
    } else {
      this.hasSavedDraft = false;
    }
  }

  goToRecoverDraft() {
    this.router.navigate(['/dashboard/agents/create']);
  }

  discardDraft() {
    if (this.isBrowser) {
      localStorage.removeItem(AGENT_DRAFT_KEY);
    }
    this.hasSavedDraft = false;
    this.savedDraft = null;
  }

  getSavedStepText(): string {
    if (!this.savedDraft) return '';
    const stepTexts: Record<string, string> = {
      agentName: 'Nombre',
      language: 'Idioma',
      template: 'Plantilla',
      greeting: 'Saludo',
      instructions: 'Instrucciones',
      voice: 'Voz',
      advanced: 'Avanzado',
      final: 'Final',
    };
    return stepTexts[this.savedDraft.step] || this.savedDraft.step;
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

    // Detectar si estamos en la sección de admin
    this.isAdminSection = url.startsWith('/admin');

    // Rutas de admin
    if (url.startsWith('/admin/tokens')) {
      this.pageTitle = 'Servicios Externos';
      this.welcomeText = '';
      this.pageSubtitle =
        'Gestiona y visualiza los tokens de API de los servicios integrados';
    } else if (url.startsWith('/admin/redes-sociales')) {
      this.pageTitle = 'Redes Sociales';
      this.welcomeText = '';
      this.pageSubtitle =
        'Gestiona y visualiza las métricas de tus redes sociales';
    } else if (url.startsWith('/admin/gasto')) {
      this.pageTitle = 'Gasto de Servicios';
      this.welcomeText = '';
      this.pageSubtitle =
        'Gestiona y visualiza el gasto de los servicios integrados';
    } else if (url.startsWith('/admin/metrics')) {
      this.pageTitle = 'Métricas';
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/admin/home') || url === '/admin') {
      this.pageTitle = 'Información General';
      this.welcomeText = '';
      this.pageSubtitle =
        'Vista general del sistema y métricas administrativas';
    } else if (url === '/dashboard/agents/create') {
      this.pageTitle = t.createAgent;
      this.welcomeText = '';
      this.pageSubtitle = '';
    } else if (url.startsWith('/dashboard/agents/edit/')) {
      this.pageTitle = '';
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
    this.showDropdown = !this.showDropdown;
  }

  selectLanguage(lang: Language) {
    this.i18nService.setLanguage(lang);
    //TODO: Tal vez hay que quitarlo
    this.updateHeader();
  }

  navigateTo(route: string) {
    if (route === '/dashboard/community') {
      // Redirigir al canal de Telegram de Llamalo AI
      window.open('https://t.me/+wDgRI51qiW1mZjdk', '_blank');
    } else {
      this.router.navigate([route]);
    }
    this.showDropdown = false;
  }

  logout() {
    // Limpiar datos de usuario
    this.userStorage.clearUser();

    this.router.navigate(['/login']);
  }

  goToGifts() {
    this.router.navigate(['/dashboard/account'], {
      queryParams: { tab: 'gifts' },
    });
    this.showDropdown = false;
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

  // Abrir sidebar móvil
  openMobileSidebar() {
    // Disparar evento personalizado para abrir el sidebar móvil
    if (this.isBrowser) {
      const event = new CustomEvent('openMobileSidebar');
      window.dispatchEvent(event);
    }
  }
}
