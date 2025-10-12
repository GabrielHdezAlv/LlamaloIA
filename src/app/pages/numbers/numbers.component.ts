import { Component, inject, OnInit, AfterViewInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Router } from '@angular/router';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';
import { isPlatformBrowser } from '@angular/common';
import { ModalService } from '../../shared/modals/modal.service';

@Component({
  selector: 'app-numbers',
  imports: [RippleButtonComponent],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss'
})
export class NumbersComponent implements OnInit, AfterViewInit {
  private i18nService = inject(I18nService);
  router = inject(Router);
  private modalService = inject(ModalService);
  private cdr: ChangeDetectorRef;

  // Variable para controlar la animación de fade in
  showContent: boolean = false;

  private isBrowser: boolean;

  // Obtener traducciones
  get t() {
    return this.i18nService.getTranslations();
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    cdr: ChangeDetectorRef
  ) {
      this.i18nService.initializeLanguage();
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

  openImportNumberModal(): void {
    const dialogRef = this.modalService.openImportNumber({
      title: 'Importar Número de Teléfono',
      message: 'Importa un número de teléfono desde tu proveedor de servicios de telecomunicaciones.'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Número importado:', result);
        // Aquí puedes agregar la lógica para procesar el número importado
        // Por ejemplo, actualizar la lista de números, mostrar un mensaje de éxito, etc.
      }
    });
  }

}
