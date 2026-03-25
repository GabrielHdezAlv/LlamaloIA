import { Component, OnInit, AfterViewInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { I18nService } from '../../core/services/i18n.service';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../shared/modals/modal.service';
import { UserService } from '../../core/services/user.service';
import { Subject, timer } from 'rxjs';
import { debounce, distinctUntilChanged, switchMap } from 'rxjs/operators';

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
  private notificationService = inject(NotificationService);
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

    // Búsqueda en vivo: sin Enter; vacío sin espera; con texto tras breve pausa (menos peticiones)
    this.searchSubject
      .pipe(
        debounce((value: string) => {
          const t = value?.trim() ?? '';
          return t.length === 0 ? timer(0) : timer(200);
        }),
        distinctUntilChanged(),
        switchMap((term) =>
          this.agentsService.getAgentsList(
            term?.trim() ? term.trim() : undefined,
          ),
        ),
      )
      .subscribe({
        next: (response) => {
          this.agents = response.agents || [];
        },
        error: (error) => {
          if (this.isBrowser && error?.status !== 401) {
            console.error('❌ Error al buscar agentes:', error);
          }
          this.agents = [];
        },
      });

    if (this.isBrowser) {
      this.searchSubject.next('');
    }
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
          this.notificationService.error(historyState.errorModal!.message);

          // Limpiar el estado después de que el modal se cierre
          if (window.history.replaceState) {
            const currentState = window.history.state || {};
            window.history.replaceState({ ...currentState, errorModal: undefined }, '');
          }
        }, 300);
      }
    }
  }

  // Handler para cambios en la barra de búsqueda (cada tecla; no hace falta Enter)
  onSearchChange(term: string): void {
    this.searchTerm = term;
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

  /** Recarga la lista respetando el filtro actual de búsqueda (p. ej. tras borrar un agente). */
  private loadAgents(): void {
    const q = this.searchTerm?.trim();
    this.agentsService.getAgentsList(q ? q : undefined).subscribe({
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
      this.notificationService.error('No se pudo identificar el agente. Por favor, recarga la página.');
      return;
    }

    // Confirmar eliminación con el mismo modal estilizado
    const dialogRef = this.modalService.openWarning({
      title: '',
      message: `¿Seguro que quieres eliminar el agente "${agent.name}"?`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      showCancelButton: true
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      // Realizar petición DELETE
      this.agentsService.deleteAgent(agentId).subscribe({
        next: (response) => {
          this.notificationService.success(response.message || 'El agente ha sido eliminado correctamente.');
          // Recargar la lista de agentes
          this.loadAgents();
        },
        error: (error) => {
          console.error('❌ Error al eliminar agente:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error al eliminar el agente. Por favor, intenta nuevamente.';
          this.notificationService.error(errorMessage);
        }
      });
    });
  }

  // Método para navegar a crear agente
  navigateToCreateAgent(): void {
    this.router.navigateByUrl('/dashboard/agents/create');
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
      this.notificationService.error('No se pudo identificar el agente. Por favor, recarga la página.');
      return;
    }

    // Navegar a la página de edición
    this.router.navigate(['/dashboard/agents/edit', agentId]);
  }

  // Método para dejar de publicar / publicar de nuevo
  stopPublishing(index: number): void {
    this.openMenuIndex = null;
    
    const agent = this.agents[index];
    if (!agent) return;

    const isInactive = agent.state === 'Inactivo';
    
    // Abrir modal de confirmación simple (para que el usuario decida)
    const dialogRef = this.modalService.openWarning({
      title: '',
      message: isInactive 
        ? `¿Quieres volver a publicar el agente "${agent.name}"?`
        : `¿Quieres dejar de publicar el agente "${agent.name}"?`,
      confirmText: isInactive ? 'Sí, publicar de nuevo' : 'Sí, dejar de publicar',
      cancelText: 'Cancelar',
      showCancelButton: true
    });

    // Suscribirse al resultado
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // Cambiar el estado del agente solo si confirma
        agent.state = isInactive ? 'Activo' : 'Inactivo';

        // Opcional: mostrar notificación informando del cambio
        if (isInactive) {
          this.notificationService.success(`Has vuelto a publicar el agente "${agent.name}".`);
        } else {
          this.notificationService.warning(`Has dejado de publicar el agente "${agent.name}".`);
        }

        // Aquí podrías agregar una llamada al backend para persistir el cambio
        // this.agentsService.updateAgentState(agent.agentId, agent.state).subscribe(...);
      }
    });
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
