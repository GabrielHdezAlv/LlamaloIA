import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  pageTitle: string = 'Inicio';
  welcomeText: string = 'Hey Maria, Bienvenido/a';

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
