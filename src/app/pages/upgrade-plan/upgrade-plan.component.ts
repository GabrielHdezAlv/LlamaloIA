import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';

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
        id: 'free' as const,
        name: t.upgradePlanFree,
        description: t.upgradePlanFreeDesc,
        price: '0',
        buttonText: t.upgradePlanFreeButton,
        highlighted: false,
        features: [
          { text: t.upgradeFeatureFree1, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { text: t.upgradeFeatureFree2, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { text: t.upgradeFeatureFree3, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { text: t.upgradeFeatureFree4, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
          { text: t.upgradeFeatureFree5, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
        ]
      },
      {
        id: 'pro' as const,
        name: t.upgradePlanPro,
        description: t.upgradePlanProDesc,
        price: '12',
        buttonText: t.upgradePlanProButton,
        highlighted: true,
        features: [
          { text: t.upgradeFeaturePro1, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { text: t.upgradeFeaturePro2, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { text: t.upgradeFeaturePro3, icon: 'M8 16a2 2 0 012-2h4a2 2 0 012 2v5H8v-5zM4.54 6.46a.5.5 0 01.707 0L1.414 10.293l7.071 7.071-7.071 7.071L1.414 20.707.707 20l7.071-7.071L.707 5.858l.707-.707z' },
          { text: t.upgradeFeaturePro4, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
          { text: t.upgradeFeaturePro5, icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
        ]
      },
      {
        id: 'premium' as const,
        name: t.upgradePlanPremium,
        description: t.upgradePlanPremiumDesc,
        price: '18',
        buttonText: t.upgradePlanPremiumButton,
        highlighted: false,
        features: [
          { text: t.upgradeFeaturePremium1, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { text: t.upgradeFeaturePremium2, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
          { text: t.upgradeFeaturePremium3, icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z' },
          { text: t.upgradeFeaturePremium4, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-11.618 5.04c-.1.393-.153.805-.153 1.23a11.983 11.983 0 003.543 8.618C5.352 20.354 8.44 22 12 22c3.56 0 6.648-1.646 8.229-4.168a11.983 11.983 0 003.543-8.618c0-.425-.053-.837-.153-1.23z' },
          { text: t.upgradeFeaturePremium5, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m10 6v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 12H4' }
        ]
      }
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
