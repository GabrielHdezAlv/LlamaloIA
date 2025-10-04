import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../../layout/nav/nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';
import { CompanySetupComponent } from '../company-setup/company-setup.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, NavComponent, CompanySetupComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild(CompanySetupComponent) companySetupComponent!: CompanySetupComponent;
  @ViewChild(NavComponent) navComponent!: NavComponent;
  private _isNavCollapsed: boolean = true;

  showCompanySetup = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    // Inicializar el estado y forzar la detección de cambios
    this._isNavCollapsed = this.navComponent?.isCollapsed ?? true;
    this.cdr.detectChanges();
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
}
