import { Component, inject, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-numbers',
  imports: [RippleButtonComponent],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss'
})
export class NumbersComponent implements OnInit, AfterViewInit {
  router = inject(Router);
  private cdr: ChangeDetectorRef;
  
  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.cdr = cdr;
  }

  ngOnInit(): void {
    // No hacer nada aquí, esperar a AfterViewInit
  }

  ngAfterViewInit(): void {
    // Ejecutar animación después de que la vista esté completamente inicializada
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    console.log('NumbersComponent startFadeInAnimation - isBrowser:', this.isBrowser);
    
    // Verificar si estamos en el navegador de manera más robusta
    const isInBrowser = typeof window !== 'undefined' && window.localStorage;
    console.log('Verificación robusta del navegador:', isInBrowser);
    
    if (!isInBrowser) {
      console.log('No es navegador, mostrando contenido inmediatamente');
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }

    console.log('Ejecutando animación con delay...');
    
    // Contenido aparece después de 100ms
    setTimeout(() => {
      console.log('Mostrando contenido de números');
      this.showContent = true;
      this.cdr.detectChanges();
    }, 100);
  }
}
