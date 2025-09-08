import { Component, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStorage } from '../../storages/user/user-storage';
import { NgIf } from '@angular/common';

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

  showDropdown = false;

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
    this.router.navigate([route]);
    this.showDropdown = false;
  }

  logout() {
    this.userStorage.clearUser();
    this.router.navigate(['/login']);
  }
}
