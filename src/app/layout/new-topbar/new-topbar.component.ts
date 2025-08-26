import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'new-topbar',
  standalone: true,
  templateUrl: './new-topbar.component.html',
  styleUrls: ['./new-topbar.component.scss'],
})
export class NewTopbarComponent implements OnInit {
  pageTitle: string = 'Inicio';
  welcomeText: string = 'Hey Maria, Bienvenido/a';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Filtrar solo eventos de finalización de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeader();
      });

    // Ejecutar al inicio para asegurar que se actualice con la ruta actual
    this.updateHeader();
  }

  updateHeader() {
    const url = this.router.url;

    // Orden importante: rutas más específicas primero
    if (url === '/dashboard/agents/create') {
      this.pageTitle = 'Crear Agente';
      this.welcomeText = '';
    } else if (url.startsWith('/dashboard/agents')) {
      this.pageTitle = 'Agentes';
      this.welcomeText = '';
    } else if (url === '/dashboard/profile') {
      this.pageTitle = 'Perfil & Facturación';
      this.welcomeText = '';
    } else {
      this.pageTitle = 'Inicio';
      this.welcomeText = 'Hey Maria, Bienvenido/a';
    }
  }
}