import { Component, inject } from '@angular/core';
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
  welcomeText: string = 'Hey Maria, Bienvenido/a';

  userStorage = inject(UserStorage);

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

    if (currentRoute.includes('/dashboard/profile')) {
      this.pageTitle = 'Perfil & Facturación';
      this.welcomeText = '';
    } else if (currentRoute.includes('/dashboard/agents')) {
      this.pageTitle = 'Agentes';
      this.welcomeText = '';
    } else {
      this.pageTitle = 'Inicio';
      this.welcomeText = 'Hey Maria, Bienvenido/a';
    }
  }
}
