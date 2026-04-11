import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserStorage } from '../../../storages/user/user-storage';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-trial-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      *ngIf="show"
      class="mx-2 mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100"
    >
      <span>
        {{ t.trialDaysLeft }}:
        <strong>{{ daysLeft }}</strong>
      </span>
      <a
        routerLink="/billing"
        class="font-semibold text-blue-700 underline hover:text-blue-900 dark:text-blue-300"
        >{{ t.trialBannerUpgrade }}</a
      >
    </div>
  `,
})
export class TrialBannerComponent {
  private userStorage = inject(UserStorage);
  private i18n = inject(I18nService);

  get t() {
    return this.i18n.getTranslations();
  }

  get show(): boolean {
    const pu = this.userStorage.user()?.planUsage;
    if (!pu?.trialActive || !pu.trialEndsAt) return false;
    return pu.effectivePlanSlug === 'gratis';
  }

  get daysLeft(): number {
    const pu = this.userStorage.user()?.planUsage;
    if (!pu?.trialEndsAt) return 0;
    const end = new Date(pu.trialEndsAt).getTime();
    return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  }
}
