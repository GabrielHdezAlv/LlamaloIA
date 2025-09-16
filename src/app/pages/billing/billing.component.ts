import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  targetAudience: string;
  features: string[];
  maxVisits?: number;
  supportType: string;
  teamMembers?: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit, AfterViewInit {
  selectedMinutes: number = 700;
  selectedPlan: BillingPlan | null = null;

  constructor(private router: Router) {}

  plans: BillingPlan[] = [
    {
      id: 'advanced',
      name: 'Advanced',
      description: 'Show social proof notifications to increase leads and sales.',
      price: 99,
      targetAudience: 'For individuals',
      features: [
        'All analytics features',
        'Up to 250,000 tracked visits',
        'Normal support',
        'Up to 3 team members'
      ],
      maxVisits: 250000,
      supportType: 'Normal support',
      teamMembers: 3
    }
  ];

  ngOnInit() {
    // Seleccionar el plan por defecto
    this.selectedPlan = this.plans[0];
  }

  ngAfterViewInit() {
    // Inicializar el slider después de que la vista esté completamente cargada
    setTimeout(() => {
      this.updateSliderBackground();
    }, 200);
  }

  onMinutesChange(event: any) {
    this.selectedMinutes = parseInt(event.target.value);
    this.updateSliderBackground();
  }

  updateSliderBackground() {
    const percentage = ((this.selectedMinutes - 100) / (2000 - 100)) * 100;
    const slider = document.querySelector('.slider') as HTMLInputElement;
    if (slider) {
      // La línea azul debe terminar exactamente donde empieza el thumb (borde izquierdo)
      // No necesitamos compensación adicional, el porcentaje directo es correcto
      slider.style.setProperty('--progress', `${percentage}%`);
    }
  }

  getStarted() {
    console.log('Plan seleccionado:', this.selectedPlan);
    console.log('Minutos seleccionados:', this.selectedMinutes);
    // Aquí implementarías la lógica para procesar el pago
  }

  goBack() {
    // Navegar de vuelta a la página de cuenta
    this.router.navigate(['/dashboard/account']);
  }

  closeModal(event: Event) {
    // Solo cerrar si se hace clic en el overlay (no en el contenido del modal)
    if (event.target === event.currentTarget) {
      this.goBack();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.goBack();
  }
}
