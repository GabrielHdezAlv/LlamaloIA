import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

const BODY_CLASS = 'page-shopify-onboarding';

@Component({
  selector: 'app-shopify-onboarding',
  standalone: true,
  imports: [],
  templateUrl: './shopify-onboarding.component.html',
  styleUrl: './shopify-onboarding.component.scss',
})
export class ShopifyOnboardingComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.add(BODY_CLASS);
      document.documentElement.classList.add(BODY_CLASS);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove(BODY_CLASS);
      document.documentElement.classList.remove(BODY_CLASS);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/agents/create']);
  }

  goToConnectShopify(): void {
    this.router.navigate(['/dashboard/agents/create'], { queryParams: { step: 'actions' } });
  }
}
