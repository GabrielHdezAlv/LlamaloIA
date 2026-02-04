/**
 * DTO para actualización de perfil
 * Campos opcionales para actualizar el perfil
 */
import { ACCOUNT_STATUS } from './account-status.enum';

export interface UpdateProfileDto {
  name?: string;
  lastname?: string;
  profileImage?: string;
  enterprise?: { name: string; url: string };
  country?: string; // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: number; // ⬅️ NUEVO: Opcional (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
}
