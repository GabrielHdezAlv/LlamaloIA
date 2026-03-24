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
  activeTab = 'xenon'; // 'xenon', 'calls', 'shopify', 'twilio', 'knowledge'

  tabs = [
    { id: 'xenon', name: 'Flujo Xenon', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }, // Lightning bolt icon
    { id: 'calls', name: 'Llamadas & WebRTC', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' }, // Phone icon
    { id: 'shopify', name: 'Integración Shopify', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' }, // Shopping bag icon
    { id: 'knowledge', name: 'Base de Conocimientos (RAG)', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }, // Book icon
    { id: 'twilio', name: 'Arquitectura Twilio', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' } // Server icon
  ];

  setTab(tabId: string) {
    this.activeTab = tabId;
  }
}
