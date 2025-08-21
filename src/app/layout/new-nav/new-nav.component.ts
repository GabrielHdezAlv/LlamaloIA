// src/app/components/sidebar/sidebar.component.ts
import { Component, HostListener, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';

@Component({
  selector: 'app-navv',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './new-nav.component.html',
  styleUrls: ['./new-nav.component.scss'],
})
export class SidebarComponent {
  isOpen: boolean = false;
  windowWidth: number = 0;

  // Inyectar UserStorage y Router
  private userStorage = inject(UserStorage);
  private router = inject(Router);

  // Propiedad computada para obtener el nombre completo del usuario
  userName = computed(() => {
    const user = this.userStorage.user();
    if (user) {
      return `${user.name} ${user.lastname}`;
    }
    return 'Usuario';
  });

  // Idiomas (por si lo necesitas después)
  languages = [
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  ];
  selectedLanguage = this.languages[0];
  showLanguageMenu = false;

  ngOnInit() {
    this.onResize();
  }

  openMenu() {
    this.isOpen = true;
  }

  closeMenu() {
    this.isOpen = false;
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showLanguageMenu = false;
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.windowWidth = window.innerWidth;
      // En pantallas grandes, el sidebar está siempre abierto
      this.isOpen = this.windowWidth >= 1280;
    }
  }

  // Método para verificar si una ruta está activa
  isRouteActive(route: string): boolean {
    const currentUrl = this.router.url;
    
    // Para la ruta de inicio, también activar cuando esté en /dashboard sin nada más
    if (route === '/dashboard/home') {
      return currentUrl === '/dashboard/home' || currentUrl === '/dashboard';
    }
    
    // Para otras rutas, verificar coincidencia exacta
    return currentUrl === route;
  }
}