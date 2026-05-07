import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AgentsService,
  OutboundCampaignStatusResponse,
} from '../../core/services/agents.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-outbound-campaign',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './outbound-campaign.component.html',
  styleUrl: './outbound-campaign.component.scss',
})
export class OutboundCampaignComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private agentsService = inject(AgentsService);
  private notificationService = inject(NotificationService);

  agentId = 0;
  agentName = '';
  loading = true;
  relaunching = false;
  campaign: OutboundCampaignStatusResponse | null = null;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('agentId');
    this.agentId = Number(raw ?? 0);
    if (!this.agentId) {
      this.notificationService.error('No se pudo resolver el agente.');
      void this.router.navigate(['/dashboard/agents']);
      return;
    }
    this.loadAgentName();
    this.loadCampaign();
  }

  private loadAgentName(): void {
    this.agentsService.getAgentsList().subscribe({
      next: (response) => {
        const current = (response.agents || []).find(
          (agent) => Number(agent.agentId || agent.phoneNumbers?.phoneId) === this.agentId,
        );
        this.agentName = current?.name || '';
      },
      error: () => {
        this.agentName = '';
      },
    });
  }

  loadCampaign(): void {
    this.loading = true;
    this.agentsService.getOutboundCampaignStatus(this.agentId).subscribe({
      next: (response) => {
        this.campaign = response;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(
          error?.error?.message ?? 'No se pudo cargar la campaña outbound.',
        );
      },
    });
  }

  relaunchCampaign(): void {
    this.relaunching = true;
    this.agentsService.relaunchOutboundCampaign(this.agentId).subscribe({
      next: (response) => {
        this.relaunching = false;
        this.notificationService.success(response.message);
        this.loadCampaign();
      },
      error: (error) => {
        this.relaunching = false;
        this.notificationService.error(
          error?.error?.message ?? 'No se pudo relanzar la campaña.',
        );
      },
    });
  }

  formatUpdatedAt(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getCampaignLabel(kind?: string | null): string {
    switch (kind) {
      case 'satisfactionSurvey':
        return 'Encuestas de satisfacción';
      case 'paymentReminder':
        return 'Recordatorio de pago';
      case 'abandonedCart':
        return 'Recuperación de carrito abandonado';
      case 'postPurchase':
        return 'Ofertas post compra';
      default:
        return 'Outbound';
    }
  }
}
