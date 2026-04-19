import type { User } from '../models/new-user.model';

/**
 * Slug de catálogo alineado con el backend (`planUsage.effectivePlanSlug` / `users.plan`).
 */
export function resolveEffectivePlanSlug(user: User | null | undefined): string {
  const fromUsage = user?.planUsage?.effectivePlanSlug?.trim().toLowerCase();
  if (fromUsage) return normalizeCatalogSlug(fromUsage);
  return normalizeCatalogSlug(user?.plan?.trim().toLowerCase() ?? '');
}

function normalizeCatalogSlug(raw: string): string {
  if (!raw) return 'gratis';
  if (raw === 'basic' || raw === 'free') return 'gratis';
  if (raw === 'pro') return 'starter';
  if (raw === 'premium') return 'scale';
  return raw;
}

/**
 * Integración Shopify (OAuth) disponible desde Growth según catálogo / API.
 */
export function isShopifyIntegrationLockedForPlan(effectiveSlug: string): boolean {
  return (
    effectiveSlug === 'gratis' ||
    effectiveSlug === 'starter' ||
    effectiveSlug === 'sin_plan'
  );
}
