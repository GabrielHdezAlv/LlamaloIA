import { Component, OnInit, AfterViewInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-new-agents',
  imports: [CommonModule, RouterModule, RippleButtonComponent],
  templateUrl: './new-agents.component.html',
  styleUrl: './new-agents.component.scss',
})
export class NewAgentsComponent implements OnInit, AfterViewInit {
  private agentsService = inject(AgentsService);
  private i18nService = inject(I18nService);
  private modalService = inject(ModalService);
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

  // TEMPORAL: Cambiar a true para probar estado vacío, false para mostrar voces ficticias
  private showEmptyState = false;

  ngOnInit(): void {
    this.i18nService.initializeLanguage();
    
    // Listar agentes del usuario
    this.loadAgents();
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

  // Método para cargar la lista de agentes
  private loadAgents(): void {
    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
        console.log('✅ Agentes del usuario:', response);
        this.agents = response.agents || [];
      },
      error: (error) => {
        console.error('❌ Error al obtener agentes:', error);
        this.agents = [];
      },
    });
  }

  // Método para eliminar un agente
  deleteAgent(agentIndex: number, agentName: string): void {
    // Confirmar eliminación
    const confirmed = confirm(`¿Está seguro de que desea eliminar el agente "${agentName}"?`);
    
    if (!confirmed) {
      return;
    }

    // Realizar petición DELETE
    this.agentsService.deleteAgent(agentIndex).subscribe({
      next: (response) => {
        console.log('✅ Agente eliminado:', response);
        this.modalService.openSuccess({
          title: 'Agente eliminado',
          message: response.message || 'El agente ha sido eliminado correctamente.'
        });
        // Recargar la lista de agentes
        this.loadAgents();
      },
      error: (error) => {
        console.error('❌ Error al eliminar agente:', error);
        const errorMessage = error?.error?.message || error?.message || 'Error al eliminar el agente. Por favor, intenta nuevamente.';
        this.modalService.openError({
          title: 'Error al eliminar agente',
          message: errorMessage
        });
      }
    });
  }
}
