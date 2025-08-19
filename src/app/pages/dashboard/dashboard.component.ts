import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../../layout/nav/nav.component';
import { TopbarComponent } from '../../layout/topbar/topbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, NavComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
