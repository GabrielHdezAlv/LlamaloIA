import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../layout/new-nav/new-nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
