import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../layout/new-nav/new-nav.component';
import { NewTopbarComponent } from '../../layout/new-topbar/new-topbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, NewTopbarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
