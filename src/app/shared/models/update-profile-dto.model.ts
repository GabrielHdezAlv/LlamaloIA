/**
 * DTO para actualización de perfil
 * Campos opcionales para actualizar el perfil
 */
import { AccountStatus } from './account-status.enum';

export interface UpdateProfileDto {
  name?: string;
  lastname?: string;
  profileImage?: string;
  enterprise?: { name: string; url: string };
  country?: string; // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
  accountStatus?: AccountStatus; // ⬅️ NUEVO: Opcional (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
}
