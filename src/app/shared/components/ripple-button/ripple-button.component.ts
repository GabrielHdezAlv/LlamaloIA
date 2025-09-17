import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RippleData {
  id: number;
  x: number;
  y: number;
  scale: number;
}

@Component({
  selector: 'app-ripple-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="buttonClass"
      [disabled]="disabled"
      (click)="onClick($event)"
      (mousedown)="onMouseDown($event)"
      #buttonRef
    >
      <ng-content></ng-content>
      <span 
        *ngFor="let ripple of ripples; trackBy: trackByIndex"
        class="ripple" 
        [style.left.px]="ripple.x"
        [style.top.px]="ripple.y"
        [style.background-color]="rippleColor"
        [style.--ripple-scale]="ripple.scale"
      ></span>
    </button>
  `,
  styles: [`
    button {
      position: relative;
      overflow: hidden;
    }
    
    .ripple {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple-animation 0.6s ease-out forwards;
    }
    
    @keyframes ripple-animation {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(var(--ripple-scale, 10));
        opacity: 0;
      }
    }
  `]
})
export class RippleButtonComponent {
  @Input() buttonClass: string = '';
  @Input() disabled: boolean = false;
  @Input() rippleColor: string = 'rgba(255, 255, 255, 0.6)';
  @Input() rippleScale: number = 10;
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  ripples: RippleData[] = [];
  private rippleId = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  onMouseDown(event: MouseEvent) {
    if (this.disabled) return;
    
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    
    // Calcular posición del ripple relativa al botón
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Crear nuevo ripple
    const ripple: RippleData = {
      id: ++this.rippleId,
      x: x,
      y: y,
      scale: this.rippleScale
    };
    
    this.ripples.push(ripple);
    
    // Remover ripple después de la animación
    setTimeout(() => {
      this.ripples = this.ripples.filter(r => r.id !== ripple.id);
      this.cdr.detectChanges();
    }, 600);
  }

  onClick(event: MouseEvent) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }

  trackByIndex(index: number, item: RippleData): number {
    return item.id;
  }
}
