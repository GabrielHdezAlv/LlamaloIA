import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { I18nService, type Translations } from '../../core/services/i18n.service';
import { UserStorage } from '../../storages/user/user-storage';
import {
  requiresBillingChurnLockPage,
} from '../../shared/utils/plan-usage.util';
import { UpgradePlanPricingViewComponent } from '../../shared/modals/upgrade-plan-modal/upgrade-plan-pricing-view.component';

/**
 * Pantalla única tras cancelar suscripción: solo elección de plan (sin navegación del dashboard).
 */
@Component({
  selector: 'app-subscribe-required',
  standalone: true,
  imports: [CommonModule, UpgradePlanPricingViewComponent],
  templateUrl: './subscribe-required.component.html',
  styleUrls: ['./subscribe-required.component.scss'],
})
export class SubscribeRequiredComponent {
  private router = inject(Router);
  private userStorage = inject(UserStorage);
  i18n = inject(I18nService);

  get t(): Translations {
    return this.i18n.getTranslations();
  }

  constructor() {
    effect(() => {
      const u = this.userStorage.user();
      if (!u?.planUsage?.limits) {
        return;
      }
      if (!requiresBillingChurnLockPage(u)) {
        void this.router.navigate(['/dashboard', 'home'], { replaceUrl: true });
      }
    });
  }
}
