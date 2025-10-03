import { Injectable, signal, inject } from '@angular/core';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class BetaService {
  private userStorage = inject(UserStorage);
  private userService = inject(UserService);
  
  // Signal para controlar si se debe mostrar la página de beta
  private showBetaPage = signal<boolean>(false);
  private minutesInbound: any = null;

  // Getter para obtener el estado basado en la fecha de creación del usuario y minutos inbound
  get shouldShowBetaPage(): boolean {
    const user = this.userStorage.user();
    
    if (!user || !user.createdAt) {
      return false;
    }

    // Verificar si el usuario tiene más de 7 días de antigüedad
    const userCreatedDate = this.parseSpanishDate(user.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - userCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const isEligibleByDays = daysDifference >= 7;
    
    // Verificar si tiene 30 o más minutos inbound
    const isEligibleByMinutes = this.minutesInbound && 
                               this.minutesInbound.minutes && 
                               this.minutesInbound.minutes >= 30;
    
    const isEligible = isEligibleByDays || isEligibleByMinutes;
    
    return isEligible;
  }

  // Método para cambiar el estado manualmente
  setShowBetaPage(show: boolean): void {
    this.showBetaPage.set(show);
  }

  // Método para ocultar la página de beta (cuando el usuario la cierre)
  hideBetaPage(): void {
    this.showBetaPage.set(false);
  }

  // Método para cargar minutos inbound
  loadMinutesInbound(): void {
    this.userService.getMinutesInbound().subscribe({
      next: (response: any) => {
        this.minutesInbound = response;
      },
      error: (error: any) => {
        console.error('❌ Error cargando minutos inbound:', error);
        this.minutesInbound = null;
      }
    });
  }

  // Método para verificar si el usuario es elegible para la beta
  isUserEligibleForBeta(): boolean {
    return this.shouldShowBetaPage;
  }

  // Método para parsear fechas en formato español
  private parseSpanishDate(dateInput: any): Date {
    try {
      // Si ya es un objeto Date, devolverlo
      if (dateInput instanceof Date) {
        return dateInput;
      }
      
      // Si es null, undefined o no es string, usar fecha actual
      if (!dateInput || typeof dateInput !== 'string') {
        return new Date();
      }
      
      const dateString = String(dateInput);
      
      // Mapeo de meses en español a números
      const monthMap: { [key: string]: number } = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };

      // Extraer día, mes y año del string
      const match = dateString.match(/(\d+) de (\w+) de (\d+)/);
      if (!match) {
        // Intentar parsear como fecha ISO o estándar
        const fallbackDate = new Date(dateString);
        if (!isNaN(fallbackDate.getTime())) {
          return fallbackDate;
        }
        return new Date(); // Fallback a fecha actual
      }

      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase();
      const year = parseInt(match[3]);

      const month = monthMap[monthName];
      if (month === undefined) {
        return new Date(); // Fallback a fecha actual
      }

      const parsedDate = new Date(year, month, day);

      return parsedDate;
    } catch (error) {
      console.error('❌ Error parseando fecha española:', error);
      return new Date(); // Fallback a fecha actual
    }
  }
}