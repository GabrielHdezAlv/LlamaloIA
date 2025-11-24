import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStorage } from '../../storages/user/user-storage';
import { NgIf, NgFor, NgClass, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, Language } from '../../core/services/i18n.service';

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  pageTitle: string = 'Inicio';
  // Texto de bienvenida que se mostrará solo en la Home
  welcomeText: string = '';

  private router = inject(Router);
  public userStorage = inject(UserStorage);
  private isBrowser: boolean;
  private i18nService = inject(I18nService);

  showDropdown = false;
  showInviteModal = false;

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
    { name: 'Sebastian Graham', email: 'sebastian.graham@example.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
    { name: 'Sara Cruz', email: 'sara.cruz@example.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
    { name: 'Michael Johnson', email: 'michael.johnson@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
    { name: 'Emma Wilson', email: 'emma.wilson@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face' },
    { name: 'David Brown', email: 'david.brown@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@example.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
    { name: 'James Taylor', email: 'james.taylor@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
    { name: 'Maria Garcia', email: 'maria.garcia@example.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face' },
    { name: 'Robert Martinez', email: 'robert.martinez@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
    { name: 'Jennifer Davis', email: 'jennifer.davis@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face' }
  ];

  // Roles disponibles
  roles = ['Can Edit', 'Can View', 'Can Comment'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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
    
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeader();
      });

    this.updateHeader();
    this.initializeTeamMembers();
  }

  initializeTeamMembers() {
    const user = this.userStorage.user();
    if (user) {
      this.teamMembers = [
        { 
          name: `${user.name} ${user.lastname}`, 
          email: user.email, 
          role: 'Owner', 
          status: 'Accepted',
          avatar: user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' 
        }
      ];
    }
  }

  updateHeader() {
    const url = this.router.url;
    const t = this.i18nService.getTranslations();

    if (url === '/dashboard/agents/create') {
      this.pageTitle = t.createAgent;
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/agents')) {
      this.pageTitle = t.agents;
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/numbers')) {
      this.pageTitle = t.numbers;
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/history')) {
      this.pageTitle = t.history;
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/metrics')) {
      this.pageTitle = t.metrics;
      this.welcomeText = '';
    } else if (url === '/dashboard/profile') {
      // No hay clave específica de perfil; usar ajustes como equivalente
      this.pageTitle = t.settings;
      this.welcomeText = '';
    } else if (url === '/dashboard/account') {
      this.pageTitle = t.settings;
      this.welcomeText = '';
    } else {
      // Home
      this.pageTitle = t.home;
      const user = this.userStorage.user();
      if (user) {
        this.welcomeText = `Bienvenido, ${user.name} ${user.lastname} 👋`;
      } else {
        this.welcomeText = 'Bienvenido 👋';
      }
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
    this.selectedEmails = this.selectedEmails.filter(e => e !== name);
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
    console.log('Toggling dropdown for:', member.name, 'Current open:', this.openDropdownMember);
    this.openDropdownMember = this.openDropdownMember === member.name ? null : member.name;
    console.log('New open dropdown:', this.openDropdownMember);
  }

  updateMemberRole(member: any, newRole: string) {
    member.role = newRole;
    this.openDropdownMember = null; // Cerrar el dropdown después de seleccionar
  }

  closeMemberDropdown() {
    this.openDropdownMember = null;
  }

  cancelInvite(member: any) {
    this.teamMembers = this.teamMembers.filter(m => m !== member);
  }

  sendInvite() {
    // Incluir el valor actual del input si aún no se ha añadido
    if (this.emailInput && this.emailInput.trim()) {
      this.addEmail();
    }

    if (this.selectedEmails.length === 0) {
      return;
    }

    // Aquí implementarías la lógica para enviar invitaciones
    console.log('Enviando invitaciones:', {
      names: this.selectedEmails,
      role: this.selectedRole
    });
    
    // Añadir los nuevos miembros a la lista (por defecto: Pending)
    this.selectedEmails.forEach(email => {
      const newMember = {
        name: email,
        email: email,
        role: this.selectedRole,
        status: 'Pending', // Otros posibles estados: 'Accepted', 'Rejected'
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' // Avatar por defecto
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
      const teamMembersContainer = document.querySelector('.team-members-container');
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
      const text = encodeURIComponent('Únete a Llamalo AI y consigue minutos extra.');
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
