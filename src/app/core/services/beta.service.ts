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
    
    console.log('🔍 BetaService - Verificando elegibilidad para beta:');
    console.log('👤 Usuario:', user ? `${user.name} ${user.lastname}` : 'No encontrado');
    console.log('📅 createdAt:', user?.createdAt || 'No disponible');
    console.log('📞 minutesInbound:', this.minutesInbound);
    
    if (!user || !user.createdAt) {
      console.log('❌ No se puede verificar elegibilidad: usuario o createdAt no disponible');
      return false;
    }

    // Verificar si el usuario tiene más de 7 días de antigüedad
    const userCreatedDate = this.parseSpanishDate(user.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - userCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('📊 Cálculo de días:');
    console.log('  📅 Fecha de creación (original):', user.createdAt);
    console.log('  📅 Fecha de creación (parseada):', userCreatedDate.toLocaleString());
    console.log('  📅 Fecha actual:', currentDate.toLocaleString());
    console.log('  📈 Días transcurridos:', daysDifference);
    console.log('  🎯 ¿Cumple 7 días?', daysDifference >= 7);
    
    const isEligibleByDays = daysDifference >= 7;
    
    // Verificar si tiene 30 o más minutos inbound
    const isEligibleByMinutes = this.minutesInbound && 
                               this.minutesInbound.minutes && 
                               this.minutesInbound.minutes >= 30;
    
    console.log('📞 Verificación de minutos:');
    console.log('  📊 Minutos inbound:', this.minutesInbound?.minutes || 'No disponible');
    console.log('  🎯 ¿Cumple 30+ minutos?', isEligibleByMinutes);
    
    const isEligible = isEligibleByDays || isEligibleByMinutes;
    
    console.log('🎯 Criterios de elegibilidad:');
    console.log('  📅 Por días (≥7):', isEligibleByDays);
    console.log('  📞 Por minutos (≥30):', isEligibleByMinutes);
    console.log('  ✅ Resultado final:', isEligible ? 'MOSTRAR BETA' : 'NO MOSTRAR BETA');
    
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
    console.log('📞 Cargando minutos inbound...');
    this.userService.getMinutesInbound().subscribe({
      next: (response: any) => {
        console.log('✅ Minutos inbound cargados:', response);
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
      console.log('🔍 Tipo de dato recibido:', typeof dateInput, dateInput);
      
      // Si ya es un objeto Date, devolverlo
      if (dateInput instanceof Date) {
        console.log('📅 Ya es un objeto Date:', dateInput);
        return dateInput;
      }
      
      // Si es null, undefined o no es string, usar fecha actual
      if (!dateInput || typeof dateInput !== 'string') {
        console.warn('⚠️ Fecha inválida o no es string:', dateInput);
        return new Date();
      }
      
      const dateString = String(dateInput);
      console.log('📝 Procesando string:', dateString);
      
      // Mapeo de meses en español a números
      const monthMap: { [key: string]: number } = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };

      // Extraer día, mes y año del string
      const match = dateString.match(/(\d+) de (\w+) de (\d+)/);
      if (!match) {
        console.warn('⚠️ No se pudo parsear la fecha con regex:', dateString);
        // Intentar parsear como fecha ISO o estándar
        const fallbackDate = new Date(dateString);
        if (!isNaN(fallbackDate.getTime())) {
          console.log('✅ Parseo fallback exitoso:', fallbackDate);
          return fallbackDate;
        }
        return new Date(); // Fallback a fecha actual
      }

      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase();
      const year = parseInt(match[3]);

      const month = monthMap[monthName];
      if (month === undefined) {
        console.warn('⚠️ Mes no reconocido:', monthName);
        return new Date(); // Fallback a fecha actual
      }

      const parsedDate = new Date(year, month, day);
      console.log('🔧 Parseando fecha española:', {
        original: dateString,
        day, month: monthName, year,
        parsed: parsedDate.toISOString()
      });

      return parsedDate;
    } catch (error) {
      console.error('❌ Error parseando fecha española:', error);
      return new Date(); // Fallback a fecha actual
    }
  }

  // Método para debug - mostrar información detallada del usuario
  debugUserInfo(): void {
    const user = this.userStorage.user();
    console.log('🔍 DEBUG - Información completa del usuario:');
    console.log('👤 Usuario completo:', user);
    console.log('📞 Minutos inbound:', this.minutesInbound);
    
    if (user && user.createdAt) {
      const userCreatedDate = this.parseSpanishDate(user.createdAt);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate.getTime() - userCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('📊 Análisis detallado:');
      console.log('  📅 Fecha de creación (original):', user.createdAt);
      console.log('  📅 Fecha de creación (parseada):', userCreatedDate.toLocaleString());
      console.log('  📅 Fecha actual:', currentDate.toLocaleString());
      console.log('  📈 Días transcurridos:', daysDifference);
      console.log('  🎯 ¿Cumple 7 días?', daysDifference >= 7);
      console.log('  ⏰ Tiempo restante para 7 días:', Math.max(0, 7 - daysDifference), 'días');
      
      // Análisis de minutos
      if (this.minutesInbound && this.minutesInbound.minutes !== undefined) {
        console.log('📞 Análisis de minutos:');
        console.log('  📊 Minutos actuales:', this.minutesInbound.minutes);
        console.log('  🎯 ¿Cumple 30+ minutos?', this.minutesInbound.minutes >= 30);
        console.log('  ⏰ Minutos restantes para 30:', Math.max(0, 30 - this.minutesInbound.minutes));
      } else {
        console.log('📞 Minutos inbound no disponibles');
      }
      
      // Criterios combinados
      const isEligibleByDays = daysDifference >= 7;
      const isEligibleByMinutes = this.minutesInbound && 
                                 this.minutesInbound.minutes && 
                                 this.minutesInbound.minutes >= 30;
      const isEligible = isEligibleByDays || isEligibleByMinutes;
      
      console.log('🎯 Criterios combinados:');
      console.log('  📅 Elegible por días:', isEligibleByDays);
      console.log('  📞 Elegible por minutos:', isEligibleByMinutes);
      console.log('  ✅ Elegible en general:', isEligible);
    } else {
      console.log('❌ No hay información de usuario o createdAt');
    }
  }
}