import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';
import { paidPlanFeatureRows } from '../../shared/modals/upgrade-plan-modal/pricing-plan-features';

@Component({
  selector: 'app-upgrade-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-plan.component.html',
  styleUrl: './upgrade-plan.component.scss'
})
export class UpgradePlanComponent implements AfterViewInit, OnDestroy {
  private i18nService = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('comparisonSection') comparisonSectionRef!: ElementRef<HTMLElement>;
  comparisonVisible = false;
  private comparisonObserver: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    const el = this.comparisonSectionRef?.nativeElement;
    if (!el) return;
    this.comparisonObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !this.comparisonVisible) {
          this.comparisonVisible = true;
          this.cdr.markForCheck();
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );
    this.comparisonObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.comparisonObserver?.disconnect();
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  get pricingPlans() {
    const t = this.t;
    return [
      {
        id: 'starter' as const,
        name: t.upgradePlanStarter,
        description: t.upgradePlanStarterDesc,
        price: '29',
        buttonText: t.upgradePlanStarterButton,
        highlighted: false,
        features: paidPlanFeatureRows('starter', t),
      },
      {
        id: 'growth' as const,
        name: t.upgradePlanGrowth,
        description: t.upgradePlanGrowthDesc,
        price: '79',
        buttonText: t.upgradePlanGrowthButton,
        highlighted: true,
        features: paidPlanFeatureRows('growth', t),
      },
      {
        id: 'scale' as const,
        name: t.upgradePlanScale,
        description: t.upgradePlanScaleDesc,
        price: '169',
        buttonText: t.upgradePlanScaleButton,
        highlighted: false,
        features: paidPlanFeatureRows('scale', t),
      },
    ];
  }

  get comparisonFeatures() {
    const t = this.t;
    return [
      { name: t.upgradeComp1, free: true, pro: true, premium: true, icon: '録' },
      { name: t.upgradeComp2, free: true, pro: true, premium: true, icon: '☺' },
      { name: t.upgradeComp3, free: true, pro: true, premium: true, icon: '⚓' },
      { name: t.upgradeComp4, free: false, pro: true, premium: true, icon: '⚡' },
      { name: t.upgradeComp5, free: false, pro: true, premium: true, icon: '🗣' },
      { name: t.upgradeComp6, free: false, pro: true, premium: true, icon: '📈' },
      { name: t.upgradeComp7, free: false, pro: true, premium: true, icon: '📅' },
      { name: t.upgradeComp8, free: false, pro: false, premium: true, icon: '🔄' },
      { name: t.upgradeComp9, free: false, pro: false, premium: true, icon: '🔔' },
      { name: t.upgradeComp10, free: false, pro: false, premium: true, icon: '★' }
    ];
  }
}
