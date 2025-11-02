import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface InfoToastData {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'loading';
  duration?: number; // en milisegundos, 0 = no auto-close
  showIcon?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-info-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './info-toast.component.html',
  styleUrls: ['./info-toast.component.scss'],
})
export class InfoToastComponent implements OnInit, OnDestroy {
  message: string = '';
  type: 'info' | 'success' | 'warning' | 'loading' = 'info';
  showIcon: boolean = true;
  icon: string = '';
  duration: number = 3000; // 3 segundos por defecto
  isVisible: boolean = false;

  private timeoutId?: number;

  ngOnInit() {
    // Mostrar con animación
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Auto-cerrar si tiene duración
    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getIcon(): string {
    if (this.icon) return this.icon;
    
    switch (this.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'loading':
        return 'refresh';
      default:
        return 'info';
    }
  }

  getTypeClass(): string {
    return `toast-${this.type}`;
  }

  close() {
    this.isVisible = false;
    // Esperar a que termine la animación antes de destruir
    setTimeout(() => {
      // El componente se destruirá automáticamente
    }, 300);
  }
}
