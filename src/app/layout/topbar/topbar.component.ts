import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserStorage } from '../../storages/user/user-storage';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  pageTitle: string = 'Inicio';
  welcomeText: string = '';

  userStorage = inject(UserStorage);
  
  // Variable para manejar el idioma actual
  currentLanguage: string = 'es';

  // Computed para obtener el nombre completo del usuario
  fullName = computed(() => {
    const user = this.userStorage.user();
    if (!user) return '';
    const name = user.name || '';
    const lastname = user.lastname || '';
    return `${name} ${lastname}`.trim();
  });

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.updateHeader();
    });

    // Listener para detectar cambios de idioma
    if (typeof window !== 'undefined') {
      window.addEventListener('languageChanged', (e: any) => {
        this.currentLanguage = e.detail.language;
        this.updateHeader();
      });
    }

    // Llamar a updateHeader al inicio para manejar la carga inicial
    this.updateHeader();
  }

  updateHeader() {
    const currentRoute = this.router.url;
    const userName = this.fullName();

    // Recuperar idioma actual del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('interfaceLanguage');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        this.currentLanguage = savedLanguage;
      }
    }

    if (currentRoute.includes('/dashboard/profile')) {
      this.pageTitle = this.currentLanguage === 'es' ? 'Perfil & Facturación' : 'Profile & Billing';
      this.welcomeText = '';
    } else if (currentRoute.includes('/dashboard/agents')) {
      this.pageTitle = this.currentLanguage === 'es' ? 'Agentes' : 'Agents';
      this.welcomeText = '';
    } else {
      this.pageTitle = this.currentLanguage === 'es' ? 'Inicio' : 'Home';
      this.welcomeText = userName 
        ? (this.currentLanguage === 'es' ? `Hey ${userName}, Bienvenido/a` : `Hey ${userName}, Welcome`)
        : (this.currentLanguage === 'es' ? 'Bienvenido/a' : 'Welcome');
    }
  }
}
