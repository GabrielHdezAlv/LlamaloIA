import type { Translations } from '../../core/services/i18n.service';

const PLANS_WITH_FULL_METRICS = new Set(['growth', 'scale', 'premium']);

/** Plan de suscripción del perfil que debe desbloquear métricas aunque `panel_analytics.tier` siga en `basic`. */
export function userPlanGrantsFullMetrics(
  planSlug: string | undefined | null,
): boolean {
  const p = planSlug?.toLowerCase().trim() ?? '';
  return PLANS_WITH_FULL_METRICS.has(p);
}

export type PlanDisplayLabelOptions = {
  /** Por defecto se antepone la palabra localizada «Plan» (p. ej. «Plan Growth»). Pon `false` solo si quieres el nombre corto («Growth»). */
  includePlanWord?: boolean;
};

/** Etiqueta localizada del plan para UI (navbar, métricas, etc.). */
export function planDisplayLabelFromTranslations(
  planSlug: string | undefined | null,
  tr: Translations,
  options?: PlanDisplayLabelOptions,
): string {
  const p = planSlug?.toLowerCase().trim() ?? '';
  let name: string;
  switch (p) {
    case 'growth':
      name = tr.upgradePlanGrowth;
      break;
    case 'scale':
      name = tr.upgradePlanScale;
      break;
    case 'starter':
      name = tr.upgradePlanStarter;
      break;
    case 'premium':
      name = tr.upgradePlanPremium;
      break;
    case 'gratis':
    case 'free':
      name = tr.upgradePlanFree;
      break;
    default:
      name = tr.upgradePlanStarter;
  }
  const includePlan = options?.includePlanWord !== false;
  if (includePlan) {
    return `${tr.planUpgradeCelebrationPlanWord} ${name}`;
  }
  return name;
}

