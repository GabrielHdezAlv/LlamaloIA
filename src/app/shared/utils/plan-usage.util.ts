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
 * Suscripción cancelada (churn): debe ir a `/subscribe-required` sin usar el resto del producto.
 * Si `billingChurnLocked` viene del perfil pero aún no hay `planUsage`, igual aplica el bloqueo.
 */
export function requiresBillingChurnLockPage(
  user: User | null | undefined,
): boolean {
  if (user?.planUsage?.effectivePlanSlug === 'sin_plan') {
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
