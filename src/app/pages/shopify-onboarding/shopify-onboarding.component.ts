import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

const BODY_CLASS = 'page-shopify-onboarding';
const MYSHOPIFY_SUFFIX = '.myshopify.com';

@Component({
  selector: 'app-shopify-onboarding',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './shopify-onboarding.component.html',
  styleUrl: './shopify-onboarding.component.scss',
})
export class ShopifyOnboardingComponent implements OnInit, OnDestroy {
  /** Valor del input "Dominio de Shopify". Debe terminar en .myshopify.com */
  shopifyDomain = '';

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

  /** Comprueba si el dominio tiene el formato correcto: *nombre.myshopify.com */
  get isDomainValid(): boolean {
    const trimmed = this.shopifyDomain.trim();
    if (!trimmed) return false;
    if (!trimmed.toLowerCase().endsWith(MYSHOPIFY_SUFFIX)) return false;
    const namePart = trimmed.slice(0, -MYSHOPIFY_SUFFIX.length).trim();
    return namePart.length > 0;
  }

  goToConnectShopify(): void {
    if (!this.isDomainValid) return;
    this.router.navigate(['/dashboard/agents/create'], {
      queryParams: { step: 'actions' },
    });
  }
}
