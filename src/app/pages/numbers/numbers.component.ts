import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RippleButtonComponent } from '../../shared/components/ripple-button/ripple-button.component';

@Component({
  selector: 'app-numbers',
  imports: [RippleButtonComponent],
  templateUrl: './numbers.component.html',
  styleUrl: './numbers.component.scss'
})
export class NumbersComponent {
  router = inject(Router);
}
