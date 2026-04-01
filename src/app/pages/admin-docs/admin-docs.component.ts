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
  activeTab: string = 'xenon'; // 'xenon', 'calls', 'shopify', 'twilio', 'knowledge', 'metrics'

  tabs = [
    { id: 'xenon', name: 'Flujo Xenon' },
    { id: 'calls', name: 'Llamadas & WebRTC' },
    { id: 'shopify', name: 'Integración Shopify' },
    { id: 'knowledge', name: 'Base de Conocimientos (RAG)' },
    { id: 'metrics', name: 'Métricas & Datos' },
    { id: 'twilio', name: 'Arquitectura Twilio' },
  ];

  setTab(tabId: string) {
    this.activeTab = tabId;
  }
}
