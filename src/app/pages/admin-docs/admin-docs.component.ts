import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-docs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-docs.component.html',
  styleUrls: ['./admin-docs.component.scss'],
})
export class AdminDocsComponent {
  activeTab: string = 'xenon';

  tabs = [
    { id: 'xenon', name: 'Flujo Xenon' },
    { id: 'environments', name: 'Entornos & despliegue' },
    { id: 'calls', name: 'Llamadas & WebRTC' },
    { id: 'shopify', name: 'Integración Shopify' },
    { id: 'knowledge', name: 'Base de Conocimientos (RAG)' },
    { id: 'plans', name: 'Planes y límites' },
    { id: 'stripe', name: 'Stripe & facturación' },
    { id: 'metrics', name: 'Métricas & Datos' },
    { id: 'twilio', name: 'Arquitectura Twilio' },
  ];

  setTab(tabId: string) {
    this.activeTab = tabId;
  }
}
