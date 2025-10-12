import { Component, OnInit, AfterViewInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';

@Component({
  selector: 'app-new-agents',
  imports: [CommonModule, RouterModule, RippleButtonComponent],
  templateUrl: './new-agents.component.html',
  styleUrl: './new-agents.component.scss',
})
export class NewAgentsComponent implements OnInit, AfterViewInit {
  private agentsService = inject(AgentsService);
  private i18nService = inject(I18nService);
  router = inject(Router);
  private cdr: ChangeDetectorRef;

  agents: Agent[] = [];

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.cdr = cdr;
  }

  // TEMPORAL: Cambiar a true para probar estado vacío, false para mostrar agentes ficticios
  private showEmptyState = true;

  ngOnInit(): void {
    this.i18nService.initializeLanguage();
    
    if (this.showEmptyState) {
      // Para probar estado vacío
      this.agents = [];
    } else {
      // Para mostrar agentes ficticios (como estaban antes)
      this.agents = [
        { labsId: '1', name: 'Carlos', photoUrl: 'assets/carlos.png' } as Agent,
        { labsId: '2', name: 'Carla', photoUrl: 'assets/carla.png' } as Agent,
      ];
    }

    // Código original comentado para cuando quieras usar el backend real:
    // this.agentsService.getAgents().subscribe({
    //   next: (agents) => (this.agents = agents || []),
    //   error: () => (this.agents = []),
    // });
  }

  ngAfterViewInit(): void {
    // Ejecutar animación después de que la vista esté completamente inicializada
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    console.log('NewAgentsComponent startFadeInAnimation - isBrowser:', this.isBrowser);
    
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;
    console.log('Verificación robusta del navegador:', isInBrowser);
    
    if (!isInBrowser) {
      console.log('No es navegador, mostrando contenido inmediatamente');
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }

    console.log('Ejecutando animación con delay...');
    
    // Contenido aparece después de 100ms
    setTimeout(() => {
      console.log('Mostrando contenido de new-agents');
      this.showContent = true;
      this.cdr.detectChanges();
    }, 100);
  }
}
