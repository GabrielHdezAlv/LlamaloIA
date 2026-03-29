import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

const MONTHS_ES_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

/** Vista embebida Shopify: KPI, tarjetas y bloque Detalle operativo (mock). */
@Component({
  selector: 'app-shopify',
  standalone: true,
  imports: [],
  templateUrl: './shopify.component.html',
  styleUrl: './shopify.component.scss',
})
export class ShopifyComponent {
  private i18n = inject(I18nService);
  private destroyRef = inject(DestroyRef);

  /** Clases de tema Polaris (light / dark) según `html.dark` en la app. */
  readonly polarisWrapperClass = signal('p-theme-light shopify-polaris-root min-h-screen');

  constructor() {
    afterNextRender(() => {
      const root = document.documentElement;
      const sync = () => {
        const dark = root.classList.contains('dark');
        this.polarisWrapperClass.set(
          `${dark ? 'p-theme-dark-experimental' : 'p-theme-light'} shopify-polaris-root min-h-screen`
        );
      };
      sync();
      const ob = new MutationObserver(sync);
      ob.observe(root, { attributes: true, attributeFilter: ['class'] });
      this.destroyRef.onDestroy(() => ob.disconnect());
    });
  }

  readonly pageTitle = 'Resumen de tu tienda';
  readonly extraSectionTitle = 'Detalle operativo';

  get t() {
    return this.i18n.getTranslations();
  }

  /** Semana calendario anterior completa (lun–dom), local. */
  get reportPeriodRange(): string {
    const start = this.previousWeekMonday();
    const end = this.previousWeekSunday();
    return this.formatDateRangeEs(start, end);
  }

  /**
   * KPI de ejemplo atados a la semana anterior: al cambiar la semana cambian los números.
   * Sustituir por datos reales del backend cuando existan.
   */
  get mock() {
    const seed = this.weekSeed();
    const mod = (n: number) => ((seed % n) + n) % n;
    const totalCalls = 65 + mod(95);
    const successfulCalls = Math.max(0, Math.min(totalCalls, totalCalls - 5 - mod(18)));
    const planMinutesTotal = Math.max(10, 28 + mod(22));
    const planMinutesUsed = Math.min(
      planMinutesTotal - 1,
      Math.max(1, 8 + mod(Math.max(1, planMinutesTotal - 4)))
    );
    return {
      totalCalls,
      totalCallsVar: -8 + mod(25),
      successfulCalls,
      successfulCallsVar: -6 + mod(22),
      totalMinutes: 120 + mod(200),
      totalMinutesVar: -5 + mod(18),
      timeSaved: 40 + mod(120),
      timeSavedVar: -4 + mod(15),
      successRatePct: 78 + mod(18),
      successRateVar: -3 + mod(12),
      planMinutesTotal,
      planMinutesUsed,
      latencyMs: 220 + mod(1850),
      latencyVar: -4 + mod(14),
      averageCallDurationSeconds: 18 + mod(312),
      durationVar: -2 + mod(11),
      consultasResueltas: 55 + mod(90),
      consultasResueltasVar: -2 + mod(10),
      consultasFallidas: 8 + mod(38),
      consultasFallidasVar: -4 + mod(9),
    };
  }

  /** % del total consultas (resueltas + fallidas) que son resueltas / fallidas; suman 100 salvo redondeo. */
  get consultasResueltasSharePct(): number {
    const r = this.mock.consultasResueltas;
    const f = this.mock.consultasFallidas;
    const t = r + f;
    if (t <= 0) return 0;
    return Math.round((100 * r) / t);
  }

  get consultasFallidasSharePct(): number {
    const t = this.mock.consultasResueltas + this.mock.consultasFallidas;
    if (t <= 0) return 0;
    return Math.max(0, 100 - this.consultasResueltasSharePct);
  }

  /** Porcentajes que suman 100 (mock semanal). */
  get top3Countries(): Array<{ name: string; percent: number }> {
    const m = (n: number) => ((this.weekSeed() % n) + n) % n;
    const p1 = 40 + m(10);
    const p2 = 30 + m(10);
    const p3 = 100 - p1 - p2;
    return [
      { name: this.t.spain, percent: p1 },
      { name: this.t.france, percent: p2 },
      { name: this.t.unitedKingdom, percent: p3 },
    ];
  }

  get averageCallDurationMinutes(): number {
    return Math.floor(this.mock.averageCallDurationSeconds / 60);
  }

  get averageCallDurationSecondsOnly(): number {
    return Math.floor(this.mock.averageCallDurationSeconds % 60);
  }

  /** Lunes 00:00 de la semana anterior (respecto a la semana en curso). */
  private previousWeekMonday(): Date {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = d.getDay();
    const toMonday = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + toMonday);
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private previousWeekSunday(): Date {
    const mon = this.previousWeekMonday();
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59, 999);
    return sun;
  }

  private weekSeed(): number {
    return Math.floor(this.previousWeekMonday().getTime() / 86400000);
  }

  private formatDateRangeEs(start: Date, end: Date): string {
    const sd = start.getDate();
    const ed = end.getDate();
    const sm = MONTHS_ES_SHORT[start.getMonth()];
    const em = MONTHS_ES_SHORT[end.getMonth()];
    const sy = start.getFullYear();
    const ey = end.getFullYear();
    if (sy === ey && start.getMonth() === end.getMonth()) {
      return `${sd}–${ed} ${sm} ${sy}`;
    }
    if (sy === ey) {
      return `${sd} ${sm} – ${ed} ${em} ${sy}`;
    }
    return `${sd} ${sm} ${sy} – ${ed} ${em} ${ey}`;
  }
}
