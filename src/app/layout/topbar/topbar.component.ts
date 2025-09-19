import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStorage } from '../../storages/user/user-storage';
import { NgIf } from '@angular/common';
import { I18nService, Language } from '../../core/services/i18n.service';

@Component({
  selector: 'topbar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  pageTitle: string = 'Inicio';
  welcomeText: string = 'Hey Maria, Bienvenido/a';

  private router = inject(Router);
  public userStorage = inject(UserStorage);
  private i18nService = inject(I18nService);

  showDropdown = false;

  // Idiomas usando el servicio de i18n
  languages = this.i18nService.getAvailableLanguages();
  selectedLanguage = this.i18nService.getCurrentLanguage();

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  userName = () => {
    const user = this.userStorage.user();
    return user ? `${user.name} ${user.lastname}` : 'Usuario';
  };

  ngOnInit() {
    this.i18nService.initializeLanguage();
    this.selectedLanguage = this.i18nService.getCurrentLanguage();
    
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

  selectLanguage(lang: Language) {
    this.i18nService.setLanguage(lang);
    this.selectedLanguage = this.i18nService.getCurrentLanguage();
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
    this.userStorage.clearUser();
    this.router.navigate(['/login']);
  }
}
