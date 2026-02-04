/**
 * Constantes para los estados de cuenta de usuario
 */
export const ACCOUNT_STATUS = {
  INACTIVE: 0, // Inactivo
  ACTIVE: 1, // Activo
  DELETED: 2, // Eliminado
  UNVERIFIED: 3, // No validado (email no verificado)
} as const;

/**
 * Tipo para los valores de accountStatus
 */
export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];
