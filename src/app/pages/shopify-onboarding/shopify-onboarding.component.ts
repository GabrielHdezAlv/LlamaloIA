import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopify-onboarding',
  standalone: true,
  imports: [],
  templateUrl: './shopify-onboarding.component.html',
  styleUrl: './shopify-onboarding.component.scss',
})
export class ShopifyOnboardingComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard/agents/create']);
  }

  goToConnectShopify(): void {
    this.router.navigate(['/dashboard/agents/create'], { queryParams: { step: 'actions' } });
  }
}
