import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, NgClass, NgStyle } from '@angular/common';
import { I18nService } from '../../core/services/i18n.service';

/** Vista embebida Shopify: KPI mock + tarjetas como Métricas (latencia, duración, países, etc.). */
@Component({
  selector: 'app-shopify',
  standalone: true,
  imports: [NgClass, NgStyle],
  templateUrl: './shopify.component.html',
  styleUrl: './shopify.component.scss',
})
export class ShopifyComponent implements OnInit {
  private i18n = inject(I18nService);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Barras al 100 % de ancho (mock estático, sin animación de entrada). */
  readonly barChartsReady = true;

  get t() {
    return this.i18n.getTranslations();
  }

  readonly mock = {
    totalCalls: 128,
    totalCallsVar: 12,
    successfulCalls: 118,
    successfulCallsVar: 8,
    totalMinutes: 240,
    totalMinutesVar: 5,
    timeSaved: 96,
    timeSavedVar: 3,
    successRate: 94,
    minutesRemaining: 45,
    minutesLimit: 100,
    /** ms — mismo criterio que métricas */
    latencyMs: 850,
    /** segundos — duración media (moderado para que el arco y el marcador se vean bien; ~120s llena el medidor) */
    averageCallDurationSeconds: 52,
  };

  // —— Latencia (copiado de metrics.component.ts, valores desde mock) ——
  latencyMaxMs = 3000;
  latencyPercentDisplay = 0;

  get latencyMs(): number {
    return this.mock.latencyMs;
  }

  get latencyPercent(): number {
    const ratio = this.latencyMs / this.latencyMaxMs;
    return Math.max(0, Math.min(1, ratio));
  }

  get latencyLabel(): string {
    if (this.latencyMs <= 1000) return this.t.fast;
    if (this.latencyMs <= 2000) return this.t.normal;
    return this.t.slow;
  }

  get latencyBadgeClasses(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-status-fast';
      case this.t.normal:
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-status-normal';
      default:
        return 'text-xs bg-red-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-status-slow';
    }
  }

  get latencyGradientStart(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return '#4ade80';
      case this.t.normal:
        return '#fb923c';
      default:
        return '#f87171';
    }
  }

  get latencyGradientEnd(): string {
    switch (this.latencyLabel) {
      case this.t.fast:
        return '#14532d';
      case this.t.normal:
        return '#c2410c';
      default:
        return '#991b1b';
    }
  }

  get latencyMarkerX(): number {
    const angle = Math.PI * (1 - this.latencyPercentDisplay);
    return 260 + 260 * Math.cos(angle);
  }

  get latencyMarkerY(): number {
    const angle = Math.PI * (1 - this.latencyPercentDisplay);
    return 320 - 260 * Math.sin(angle);
  }

  // —— Duración media ——
  maxCallDurationSeconds = 120;
  durationPercentDisplay = 0;

  get averageCallDurationSeconds(): number {
    return this.mock.averageCallDurationSeconds;
  }

  get averageCallDurationMinutes(): number {
    return Math.floor(this.averageCallDurationSeconds / 60);
  }

  get averageCallDurationSecondsOnly(): number {
    return Math.floor(this.averageCallDurationSeconds % 60);
  }

  get durationLabel(): string {
    const totalMinutes = this.averageCallDurationSeconds / 60;
    if (totalMinutes <= 4) return this.t.normal;
    return this.t.long;
  }

  get durationBadgeClasses(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-duration-normal';
      case this.t.long:
        return 'text-xs bg-orange-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-duration-long';
      default:
        return 'text-xs bg-green-200 text-black px-2 py-1.5 rounded-lg font-medium metrics-status-badge metrics-duration-normal';
    }
  }

  get durationPercent(): number {
    const ratio = this.averageCallDurationSeconds / this.maxCallDurationSeconds;
    return Math.max(0, Math.min(1, ratio));
  }

  get durationGradientStart(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return '#4ade80';
      case this.t.long:
        return '#fb923c';
      default:
        return '#4ade80';
    }
  }

  get durationGradientEnd(): string {
    switch (this.durationLabel) {
      case this.t.normal:
        return '#14532d';
      case this.t.long:
        return '#c2410c';
      default:
        return '#14532d';
    }
  }

  get durationMarkerX(): number {
    const angle = Math.PI * (1 - this.durationPercentDisplay);
    return 260 + 260 * Math.cos(angle);
  }

  get durationMarkerY(): number {
    const angle = Math.PI * (1 - this.durationPercentDisplay);
    return 320 - 260 * Math.sin(angle);
  }

  ngOnInit(): void {
    this.latencyPercentDisplay = this.latencyPercent;
    this.durationPercentDisplay = this.durationPercent;
  }

  /** URLs absolutas para banderas (mismo criterio que métricas). */
  countryFlagUrl(assetPath: string): string {
    if (!assetPath) {
      return '';
    }
    let path = assetPath.replace(/^\.\//, '');
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    if (!this.isBrowser) {
      return path;
    }
    try {
      return new URL(path, this.document.baseURI).href;
    } catch {
      return path;
    }
  }

  countryFlagBackgroundStyle(assetPath: string): { [key: string]: string } {
    const url = this.countryFlagUrl(assetPath);
    return url ? { 'background-image': `url("${url}")` } : {};
  }

  getCountryBarDelay(index: number): number {
    return index * 200;
  }

  get countries(): Array<{ name: string; percent: number; img: string }> {
    return [
      { name: this.t.spain, percent: 42, img: 'assets/spain.webp' },
      { name: this.t.france, percent: 28, img: 'assets/france.webp' },
      { name: this.t.unitedKingdom, percent: 18, img: 'assets/united-kingdom.webp' },
    ];
  }

  get successEvaluation(): Array<{ name: string; percent: number }> {
    return [
      { name: 'Exitoso', percent: 58 },
      { name: 'Parcial', percent: 27 },
      { name: 'Fallido', percent: 15 },
    ];
  }

  get callCompletionReasons(): Array<{ name: string; percent: number }> {
    return [
      { name: 'Completada exitosamente', percent: 48 },
      { name: 'Cliente colgó', percent: 22 },
      { name: 'Error técnico', percent: 18 },
      { name: 'Tiempo agotado', percent: 12 },
    ];
  }

  minutesBarPercent(): number {
    const { minutesRemaining, minutesLimit } = this.mock;
    if (!minutesLimit || minutesLimit <= 0) return 0;
    return Math.min(100, Math.max(0, (minutesRemaining / minutesLimit) * 100));
  }
}
