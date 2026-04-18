/** Modo de UI del bloque de precios (modal MatDialog o embebido en onboarding). */
export type UpgradePlanPricingViewMode =
  | 'registration'
  | 'paywall'
  | 'embedded'
  | 'upgrade'
  /** Tras cancelar suscripción: solo planes, Checkout (no portal), sin trial Starter si no aplica. */
  | 'churn';
