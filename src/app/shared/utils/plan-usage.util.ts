import type { User } from '../models/new-user.model';

export type PlanUsageLike = NonNullable<User['planUsage']>;

/** True si el usuario puede crear otro agente según planUsage del perfil. */
export function canAddAnotherAgent(planUsage: PlanUsageLike | undefined): boolean {
  if (!planUsage?.limits) return true;
  if (!planUsage.trialActive && planUsage.effectivePlanSlug === 'gratis') {
    return false;
  }
  return planUsage.agentsCount < planUsage.limits.agents;
}

export function canAddWebSource(planUsage: PlanUsageLike | undefined): boolean {
  if (!planUsage?.limits) return true;
  if (!planUsage.trialActive && planUsage.effectivePlanSlug === 'gratis') {
    return false;
  }
  return planUsage.webSourcesCount < planUsage.limits.indexedUrls;
}

export function canAddDocumentSource(planUsage: PlanUsageLike | undefined): boolean {
  if (!planUsage?.limits) return true;
  if (!planUsage.trialActive && planUsage.effectivePlanSlug === 'gratis') {
    return false;
  }
  return planUsage.docSourcesCount < planUsage.limits.documentsMax;
}
