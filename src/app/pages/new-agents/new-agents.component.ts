import { Component, OnInit, AfterViewInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { ModalService } from '../../shared/modals/modal.service';
import { UserService } from '../../core/services/user.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
  private userService = inject(UserService);
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr: ChangeDetectorRef;

  agents: Agent[] = [];
  openMenuIndex: number | null = null;

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  private isBrowser: boolean;
  private errorModalShown: boolean = false;

  // Búsqueda
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

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

    // Suscribirse a los cambios de búsqueda con debounce
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => this.agentsService.getAgentsList(term && term.trim().length > 0 ? term : undefined))
      )
      .subscribe({
        next: (response) => {
          this.agents = response.agents || [];
        },
        error: (error) => {
          console.error('❌ Error al buscar agentes:', error);
          this.agents = [];
        },
      });

    // Listar agentes del usuario inicialmente (sin búsqueda)
    this.loadAgents();
  }

  ngAfterViewInit(): void {
    // Ejecutar animación después de que la vista esté completamente inicializada
    this.startFadeInAnimation();

    // Comprobar si venimos de otra pantalla con un error que deba mostrarse aquí
    // Hacerlo en ngAfterViewInit para asegurar que el componente esté completamente renderizado
    if (!this.errorModalShown && typeof window !== 'undefined') {
      const historyState = window.history?.state as { errorModal?: { title: string; message: string } } | undefined;
      
      if (historyState?.errorModal) {
        this.errorModalShown = true;
        // Usar setTimeout para asegurar que el modal se abra después de que el componente esté completamente inicializado
        setTimeout(() => {
          const dialogRef = this.modalService.openError({
            title: historyState.errorModal!.title,
            message: historyState.errorModal!.message,
          });
          
          // Limpiar el estado después de que el modal se cierre
          dialogRef.afterClosed().subscribe(() => {
            if (window.history.replaceState) {
              const currentState = window.history.state || {};
              window.history.replaceState({ ...currentState, errorModal: undefined }, '');
            }
          });
        }, 300);
      }
    }
  }

  // Handler para cambios en la barra de búsqueda
  onSearchChange(term: string): void {
    this.searchTerm = term;

    // Si el input está vacío, recargamos la lista completa sin query param
    if (!term || term.trim().length === 0) {
      this.loadAgents();
      return;
    }

    this.searchSubject.next(term);
  }

  private startFadeInAnimation(): void {
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;

    if (!isInBrowser) {
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }

    // Contenido aparece después de un momento (como en inicio)
    setTimeout(() => {
      this.showContent = true;
      this.cdr.detectChanges();
    }, 180);
  }

  // Método para cargar la lista de agentes
  private loadAgents(): void {
    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
        this.agents = response.agents || [];
      },
      error: (error) => {
        console.error('❌ Error al obtener agentes:', error);
        this.agents = [];
      },
    });
  }

  // Método para eliminar un agente
  deleteAgent(agent: Agent): void {
    this.openMenuIndex = null;
    
    // Obtener el agentId (usar agentId o phoneId como fallback)
    const agentId = agent.agentId || agent.phoneNumbers?.phoneId;
    
    if (!agentId) {
      this.modalService.openError({
        title: 'Error',
        message: 'No se pudo identificar el agente. Por favor, recarga la página e intenta nuevamente.'
      });
      return;
    }
    
    // Confirmar eliminación
    const confirmed = confirm(`¿Está seguro de que desea eliminar el agente "${agent.name}"?`);

    if (!confirmed) {
      return;
    }

    // Realizar petición DELETE
    this.agentsService.deleteAgent(agentId).subscribe({
      next: (response) => {
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

  // Método para verificar si el usuario tiene configuración de Twilio
  private checkTwilioConfig(): void {
    this.userService.getUserProfile().subscribe({
      next: (profile) => {
        const hasTwilioConfig = profile.twilio?.twilioSid && profile.twilio?.twilioToken;

        if (!hasTwilioConfig) {
          // Mostrar modal indicando que debe configurar Twilio primero
          this.modalService.openError({
            title: 'Configuración de Twilio requerida',
            message: 'Para crear un agente, primero debes configurar tus credenciales de Twilio. Por favor, ve a Ajustes > Conexiones > Twilio para configurar tu Account SID y Auth Token.'
          });
        } else {
          // Si tiene la configuración, navegar a crear agente
          this.router.navigateByUrl('/dashboard/agents/create');
        }
      },
      error: (error) => {
        console.error('Error al verificar configuración de Twilio:', error);
        // En caso de error, mostrar el modal de todas formas para ser seguro
        this.modalService.openError({
          title: 'Configuración de Twilio requerida',
          message: 'Para crear un agente, primero debes configurar tus credenciales de Twilio. Por favor, ve a Ajustes > Conexiones > Twilio para configurar tu Account SID y Auth Token.'
        });
      }
    });
  }

  // Método para navegar a crear agente (con validación)
  navigateToCreateAgent(): void {
    this.checkTwilioConfig();
  }

  // Método para abrir/cerrar el menú de acciones
  toggleMenu(index: number): void {
    if (this.openMenuIndex === index) {
      this.openMenuIndex = null;
    } else {
      this.openMenuIndex = index;
    }
  }

  // Método para editar agente
  editAgent(index: number): void {
    this.openMenuIndex = null;
    
    const agent = this.agents[index];
    if (!agent) {
      console.error('Agente no encontrado en el índice:', index);
      return;
    }

    // Obtener el ID del agente (agentId o phoneId como fallback)
    const agentId = agent.agentId || agent.phoneNumbers?.phoneId;
    
    if (!agentId) {
      this.modalService.openError({
        title: 'Error',
        message: 'No se pudo identificar el agente. Por favor, recarga la página e intenta nuevamente.'
      });
      return;
    }

    // Navegar a la página de edición
    this.router.navigate(['/dashboard/agents/edit', agentId]);
  }

  // Método para dejar de publicar
  stopPublishing(index: number): void {
    this.openMenuIndex = null;
    // TODO: Implementar lógica para dejar de publicar
  }

  // Cerrar menú al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.openMenuIndex = null;
    }
  }
}
