import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStorage } from '../../storages/user/user-storage';
import { NgIf, NgFor, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  pageTitle: string = 'Inicio';
  welcomeText: string = 'Hey Maria, Bienvenido/a';

  private router = inject(Router);
  public userStorage = inject(UserStorage);
  private isBrowser: boolean;

  showDropdown = false;
  showInviteModal = false;

  // Variables para el modal de invitación
  emailInput: string = 'Sal';
  selectedEmails: string[] = ['Savannah Nguyen', 'Ronald Richards', 'Devon Lane', 'Esther Howard', 'Wade Warren'];
  selectedRole: string = 'Can Edit';
  showSuggestions: boolean = false;
  hoveredSuggestionIndex: number = -1;

  // Lista de miembros actuales del equipo
  teamMembers: any[] = [
    { name: 'Ronald Richards', email: 'ronald@example.com', role: 'Owner' },
    { name: 'Cameron Williamson', email: 'cameron@example.com', role: 'Can Edit' },
    { name: 'Arlene McCoy', email: 'arlene@example.com', role: 'Can Edit' },
    { name: 'Jerome Bell', email: 'jerome@example.com', role: 'Can Edit' },
    { name: 'Dianne Russell', email: 'dianne@example.com', role: 'Can Edit' }
  ];

  // Sugerencias de contactos
  contactSuggestions: any[] = [
    { name: 'Sebastian Graham', email: 'sebastian.graham@example.com' },
    { name: 'Sara Cruz', email: 'sara.cruz@example.com' }
  ];

  // Roles disponibles
  roles = ['Can Edit', 'Can View', 'Can Comment'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];
  selectedLanguage = this.languages[0];

  userName = () => {
    const user = this.userStorage.user();
    return user ? `${user.name} ${user.lastname}` : 'Usuario';
  };

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeader();
      });

    this.updateHeader();
  }

  updateHeader() {
    const url = this.router.url;

    if (url === '/dashboard/agents/create') {
      this.pageTitle = 'Crear Agente';
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/agents')) {
      this.pageTitle = 'Agentes';
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/numbers')) {
      this.pageTitle = 'Tus Numeros';
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/history')) {
      this.pageTitle = 'Historial & Transcripciones';
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/metrics')) {
      this.pageTitle = 'Métricas';
      this.welcomeText = '';
    } else if (url === '/dashboard/profile') {
      this.pageTitle = 'Perfil & Facturación';
      this.welcomeText = '';
    } else if (url === '/dashboard/account') {
      this.pageTitle = 'Ajustes';
      this.welcomeText = '';
    } else {
      this.pageTitle = 'Inicio';
      this.welcomeText = 'Hey Maria, Bienvenido/a';
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
  }

  navigateTo(route: string) {
    if (route === '/dashboard/community') {
      // Redirigir al canal de Telegram de Llámalo AI
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
    const email = this.emailInput.trim();
    if (email && !this.selectedEmails.includes(email)) {
      this.selectedEmails.push(email);
      this.emailInput = '';
      this.showSuggestions = false;
    }
  }

  removeEmail(email: string) {
    this.selectedEmails = this.selectedEmails.filter(e => e !== email);
  }

  selectSuggestion(suggestion: any) {
    const email = suggestion.email;
    if (!this.selectedEmails.includes(email)) {
      this.selectedEmails.push(email);
      this.emailInput = '';
      this.showSuggestions = false;
    }
  }

  updateMemberRole(member: any, newRole: string) {
    member.role = newRole;
  }

  sendInvite() {
    // Aquí implementarías la lógica para enviar invitaciones
    console.log('Enviando invitaciones:', {
      emails: this.selectedEmails,
      role: this.selectedRole
    });
    
    // Limpiar el formulario después de enviar
    this.selectedEmails = [];
    this.emailInput = '';
    this.selectedRole = 'Can Edit';
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeInviteModal();
    }
  }
}
