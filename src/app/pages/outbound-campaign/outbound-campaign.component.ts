import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AgentsService,
  OutboundCampaignStatusResponse,
} from '../../core/services/agents.service';
import { NotificationService } from '../../core/services/notification.service';
import { parseOutboundScheduleNotes } from '../new-create-agents/steps/schedule-campaign-step/schedule-campaign-step.component';
import { parseOutboundSegmentationNotes } from '../new-create-agents/steps/segmentation-step/segmentation-step.component';

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

  private readonly weekdayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  private readonly initialDelayLabels: Record<string, string> = {
    '30m_abandon': '30 minutos',
    '1h_abandon': '1 hora',
    '2h_abandon': '2 horas',
    '24h_abandon': '24 horas',
  };

  private readonly retryIntervalLabels: Record<string, string> = {
    '1h': '1 hora',
    '2h': '2 horas',
    '4h': '4 horas',
    '24h': '24 horas',
  };

  private readonly countryLabels: Record<string, string> = {
    es: 'España (+34)',
    pt: 'Portugal (+351)',
    fr: 'Francia (+33)',
    mx: 'México (+52)',
  };

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
          (agent) =>
            Number(agent.agentId || agent.phoneNumbers?.phoneId) === this.agentId,
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
      timeZone: 'Europe/Madrid',
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

  getShortCallSid(callSid?: string): string {
    if (!callSid) return '-';
    if (callSid.length <= 12) return callSid;
    return `${callSid.slice(0, 8)}...`;
  }

  async copyCallSid(callSid?: string): Promise<void> {
    if (!callSid || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(callSid);
      this.notificationService.success('CALL SID copiado');
    } catch {
      this.notificationService.error('No se pudo copiar el CALL SID');
    }
  }

  /** Resumen legible de horario (Europe/Madrid, coherente con el backend). */
  getScheduleHorarioSummary(): string {
    const raw = this.campaign?.outboundScheduleCampaignNotes;
    const form = parseOutboundScheduleNotes(raw ?? '');
    if (form.useCustomSchedule) {
      const days = this.weekdayLabels.filter((_, i) => form.customWeekdays[i]);
      const daysStr = days.length ? days.join(', ') : 'Ningún día seleccionado';
      return `Personalizado · ${daysStr} · ${form.customTimeFrom}–${form.customTimeTo} (Europe/Madrid)`;
    }
    return 'Horario comercial · lun–vie · 09:00–18:00 (Europe/Madrid)';
  }

  getScheduleFrequencySummary(): string {
    const raw = this.campaign?.outboundScheduleCampaignNotes;
    const form = parseOutboundScheduleNotes(raw ?? '');
    const delay =
      this.initialDelayLabels[form.initialDelay] ?? form.initialDelay;
    const interval =
      this.retryIntervalLabels[form.retriesInterval] ??
      form.retriesInterval;
    return `Primera llamada tras al menos ${delay} (tras cumplir ventana horaria). Reintentos: ${form.retriesCount} × cada ${interval}. Máx. ${form.maxCallsPerDay} llamadas al mismo número por día natural.`;
  }

  getSegmentationSummary(): string {
    const kind = this.campaign?.campaignKind;
    const raw = this.campaign?.outboundSegmentationNotes;
    const seg = parseOutboundSegmentationNotes(raw ?? '');
    const country =
      this.countryLabels[seg.country] ??
      `País código «${seg.country || '?'}»`;

    if (kind === 'satisfactionSurvey') {
      const t =
        seg.surveyTimeSincePurchase === '1h'
          ? '1 hora'
          : seg.surveyTimeSincePurchase === '3h'
            ? '3 horas'
            : seg.surveyTimeSincePurchase === '24h'
              ? '24 horas'
              : seg.surveyTimeSincePurchase;
      const ticket =
        (seg.surveyTicketValue || '').trim()
          ? ` Ticket de compra ${seg.surveyTicketOp} ${seg.surveyTicketValue} € (referencia; el CSV no valida importes por fila).`
          : '';
      return `Solo números que coincidan con ${country}. Tiempo mínimo desde la compra (regla de cadencia): ${t}.${ticket}`;
    }

    if (kind === 'abandonedCart') {
      const abandon =
        seg.abandonTime === '24h'
          ? '24 h'
          : seg.abandonTime === '48h'
            ? '48 h'
            : seg.abandonTime === '7d'
              ? '7 días'
              : seg.abandonTime;
      return `País: ${country}. Ventana de abandono referenciada: ${abandon}.`;
    }

    if (kind === 'paymentReminder') {
      return `País: ${country}. Recordatorio según vencimiento configurado (${seg.paymentDue}).`;
    }

    return `País objetivo: ${country}.`;
  }
}
