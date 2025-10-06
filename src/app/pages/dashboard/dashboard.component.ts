import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavComponent } from '../../layout/nav/nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { CompanySetupComponent } from '../company-setup/company-setup.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, TopbarComponent, NavComponent, CompanySetupComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild(CompanySetupComponent) companySetupComponent!: CompanySetupComponent;
  @ViewChild(NavComponent) navComponent!: NavComponent;
  private _isNavCollapsed: boolean = true;

  showCompanySetup = false;
  showMobileSidebar = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    // Inicializar el estado y forzar la detección de cambios
    this._isNavCollapsed = this.navComponent?.isCollapsed ?? true;
    this.cdr.detectChanges();

    // Escuchar evento para abrir sidebar móvil (solo en navegador)
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('openMobileSidebar', () => {
        this.openMobileSidebar();
      });
    }
  }

  get isNavCollapsed(): boolean {
    if (this.navComponent) {
      this._isNavCollapsed = this.navComponent.isCollapsed;
    }
    return this._isNavCollapsed;
  }

  toggleCompanySetup() {
    this.showCompanySetup = !this.showCompanySetup;
    if (this.companySetupComponent) {
      this.companySetupComponent.toggleSetup();
    }
  }

  openMobileSidebar() {
    this.showMobileSidebar = true;
  }

  closeMobileSidebar() {
    this.showMobileSidebar = false;
  }
}
