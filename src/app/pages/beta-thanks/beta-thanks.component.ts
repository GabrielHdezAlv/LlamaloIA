import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BetaService } from '../../core/services/beta.service';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';

@Component({
  selector: 'app-beta-thanks',
  imports: [],
  templateUrl: './beta-thanks.component.html',
  styleUrl: './beta-thanks.component.scss',
})
export class BetaThanksComponent {
  private router = inject(Router);
  private betaService = inject(BetaService);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);

  constructor() {
    // Verificar si el usuario debe estar aquí al cargar la página
    console.log('🔄 BetaThanksComponent - Verificando elegibilidad al cargar página');
    this.betaService.debugUserInfo();
    
    if (!this.betaService.shouldShowBetaPage) {
      console.log('⚠️ Usuario no es elegible para beta, redirigiendo al dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  // Método para cerrar sesión
  logout(): void {
    // Limpiar datos del usuario
    this.userStorage.clearUser();
    this.twilioStorage.clearConfig();
    
    // Limpiar token del localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
    
    // Ocultar página de beta
    this.betaService.hideBetaPage();
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // Método para agendar llamada
  scheduleCall(): void {
    console.log('Agendando llamada - redirigiendo a Google Calendar');
    // Redirigir a Google Calendar para agendar llamada
    window.open('https://calendar.app.google/uDJALjMxgaK8HQrs5', '_blank');
  }

  // Método para feedback
  provideFeedback(): void {
    console.log('Abriendo formulario de feedback');
    // Redirigir al formulario de Google Forms para feedback
    window.open('https://forms.gle/MGvvv22rvRMdNeXh9', '_blank');
  }

  // Método para unirse a la comunidad
  joinCommunity(): void {
    console.log('Uniéndose a la comunidad - redirigiendo a LinkedIn');
    // Redirigir a la página de LinkedIn de Llamalo AI
    window.open('https://www.linkedin.com/company/llamalo-ai/', '_blank');
  }
}
