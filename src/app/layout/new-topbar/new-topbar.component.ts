import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'new-topbar',
  standalone: true,
  templateUrl: './new-topbar.component.html',
  styleUrls: ['./new-topbar.component.scss'],
})
export class NewTopbarComponent {
  pageTitle: string = 'Inicio';
  welcomeText: string = 'Hey Maria, Bienvenido/a';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.updateHeader();
    });
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
