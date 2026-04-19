import type { User } from '../models/new-user.model';

export type PlanUsageLike = NonNullable<User['planUsage']>;

/** Coincide con backend / UI de facturación bloqueada. */
const STRIPE_SUBSCRIPTION_BLOCKED = new Set([
  'past_due',
  'unpaid',
  'paused',
  'incomplete',
]);

/**
 * Trial de 7 días agotado en cuenta gratis, o pago de suscripción pendiente en Stripe.
 * Mientras sea true, la app fuerza el modal de planes y bloquea el resto de la UI.
 */
export function requiresSubscriptionPaywall(
  user: User | null | undefined,
): boolean {
  if (!user?.planUsage?.limits) return false;
  const pu = user.planUsage;
  const slug = pu.effectivePlanSlug;
  if (!pu.trialActive && (slug === 'gratis' || slug === 'sin_plan')) return true;
  const st = user.stripeSubscriptionStatus?.trim();
  if (st && STRIPE_SUBSCRIPTION_BLOCKED.has(st)) return true;
  return false;
}

/**
 * Cobro fallido / incompleto en Stripe: puede permanecer en `/subscribe-required` (precios + portal)
 * aunque no sea churn (`sin_plan`).
 */
export function requiresPaymentFailureSubscribePage(
  user: User | null | undefined,
): boolean {
  const st = user?.stripeSubscriptionStatus?.trim();
  return !!(st && STRIPE_SUBSCRIPTION_BLOCKED.has(st));
}

/**
 * Solo `/subscribe-required` hasta contratar de nuevo: churn (`sin_plan`), trial de 7 días
 * del plan `gratis` agotado, o cuenta con `billingChurnLocked` y condiciones de paywall.
 */
export function requiresBillingChurnLockPage(
  user: User | null | undefined,
): boolean {
  if (user?.planUsage?.effectivePlanSlug === 'sin_plan') {
    return true;
  }
  const pu = user?.planUsage;
  if (
    pu?.limits &&
    pu.effectivePlanSlug === 'gratis' &&
    pu.trialActive === false
  ) {
    return true;
  }
  if (user?.billingChurnLocked !== true) return false;
  if (!user?.planUsage?.limits) return true;
  return requiresSubscriptionPaywall(user);
}

/** True si el usuario puede crear otro agente según planUsage del perfil. */
export function canAddAnotherAgent(planUsage: PlanUsageLike | undefined): boolean {
  if (!planUsage?.limits) return true;
  const slug = planUsage.effectivePlanSlug;
  if (!planUsage.trialActive && (slug === 'gratis' || slug === 'sin_plan')) {
    return false;
  }
  return planUsage.agentsCount < planUsage.limits.agents;
}

export function canAddWebSource(planUsage: PlanUsageLike | undefined): boolean {
  if (!planUsage?.limits) return true;
  const slug = planUsage.effectivePlanSlug;
  if (!planUsage.trialActive && (slug === 'gratis' || slug === 'sin_plan')) {
    return false;
  }
  return planUsage.webSourcesCount < planUsage.limits.indexedUrls;
}

export function canAddDocumentSource(planUsage: PlanUsageLike | undefined): boolean {
  if (!planUsage?.limits) return true;
  const slug = planUsage.effectivePlanSlug;
  if (!planUsage.trialActive && (slug === 'gratis' || slug === 'sin_plan')) {
    return false;
  }
  return planUsage.docSourcesCount < planUsage.limits.documentsMax;
}
