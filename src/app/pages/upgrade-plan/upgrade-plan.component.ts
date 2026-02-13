import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upgrade-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-plan.component.html',
  styleUrl: './upgrade-plan.component.scss'
})
export class UpgradePlanComponent {
  pricingPlans = [
    {
      name: 'Gratis',
      description: 'Prueba la potencia de la IA con funciones básicas de voz.',
      price: '0',
      buttonText: 'Empezar ahora',
      highlighted: false,
      features: [
        'Llamadas en tiempo real',
        'Hasta 100 minutos/mes',
        '1 Agente activo',
        'Voces estándar',
        'Historial básico'
      ]
    },
    {
      name: 'Pro',
      description: 'Desbloquea análisis avanzados y automatización con IA.',
      price: '12',
      buttonText: 'Prueba Pro Gratis',
      highlighted: true,
      features: [
        'Análisis de llamadas Pro',
        'Agentes ilimitados',
        'Integración con CRM',
        'Voces Premium (clonadas)',
        'Soporte prioritario'
      ]
    },
    {
      name: 'Premium',
      description: 'Obtén todas las funciones incluyendo despliegue dedicado.',
      price: '18',
      buttonText: 'Elegir Premium',
      highlighted: false,
      features: [
        'Infraestructura dedicada',
        'API Enterprise',
        'Formación de modelos propia',
        'SLA garantizado',
        'Account Manager dedicado'
      ]
    }
  ];

  comparisonFeatures = [
    { name: 'Noticias en directo', free: true, pro: true, premium: true, icon: '録' },
    { name: 'Análisis de inversiones', free: true, pro: true, premium: true, icon: '☺' },
    { name: 'Integración Webhook', free: true, pro: true, premium: true, icon: '⚓' },
    { name: 'IA Auto-mejorada', free: false, pro: true, premium: true, icon: '⚡' },
    { name: 'Clonación de Voz', free: false, pro: true, premium: true, icon: '🗣' },
    { name: 'Reportes Detallados', free: false, pro: true, premium: true, icon: '📈' },
    { name: 'Planificación personalizada', free: false, pro: true, premium: true, icon: '📅' },
    { name: 'Sincronización multi-cuenta', free: false, pro: false, premium: true, icon: '🔄' },
    { name: 'Alertas de Mercado', free: false, pro: false, premium: true, icon: '🔔' },
    { name: 'Asesoría Experta', free: false, pro: false, premium: true, icon: '★' }
  ];
}
