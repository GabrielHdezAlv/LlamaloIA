import { Component, ViewChild } from '@angular/core';
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
export class DashboardComponent {
  @ViewChild(CompanySetupComponent) companySetupComponent!: CompanySetupComponent;
  
  showCompanySetup = false;

  toggleCompanySetup() {
    this.showCompanySetup = !this.showCompanySetup;
    if (this.companySetupComponent) {
      this.companySetupComponent.toggleSetup();
    }
  }
}
