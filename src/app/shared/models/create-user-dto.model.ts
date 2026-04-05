/**
 * DTO para registro de usuario
 * Campos requeridos para el registro
 */
import { ACCOUNT_STATUS } from './account-status.enum';
import { USER_ROLE } from './user-role.enum';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  country?: string;
  marketingConsent: boolean; // ✅ NUEVO - Requerido
  accountStatus: number; // ⬅️ NUEVO: Obligatorio (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
  rol: USER_ROLE; // ⬅️ NUEVO: Obligatorio (owner/client_user)
}
