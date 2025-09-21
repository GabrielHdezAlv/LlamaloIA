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

    // Llamar a updateHeader al inicio para manejar la carga inicial
    this.updateHeader();
  }

  updateHeader() {
    const currentRoute = this.router.url;
    const userName = this.fullName();

    if (currentRoute.includes('/dashboard/profile')) {
      this.pageTitle = 'Perfil & Facturación';
      this.welcomeText = '';
    } else if (currentRoute.includes('/dashboard/agents')) {
      this.pageTitle = 'Agentes';
      this.welcomeText = '';
    } else {
      this.pageTitle = 'Inicio';
      this.welcomeText = userName ? `Hey ${userName}, Bienvenido/a` : 'Bienvenido/a';
    }
  }
}
