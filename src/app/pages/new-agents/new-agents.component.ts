import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-new-agents',
  imports: [CommonModule, RouterModule],
  templateUrl: './new-agents.component.html',
  styleUrl: './new-agents.component.scss',
})
export class NewAgentsComponent implements OnInit {
  private agentsService = inject(AgentsService);
  private i18nService = inject(I18nService);

  agents: Agent[] = [];

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
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
}
