/**
 * DTO para registro de usuario
 * Campos requeridos para el registro
 */
import { AccountStatus } from './account-status.enum';

export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  country: string; // ✅ NUEVO - Requerido
  marketingConsent: boolean; // ✅ NUEVO - Requerido
  accountStatus: AccountStatus; // ⬅️ NUEVO: Obligatorio (0 = Inactivo, 1 = Activo, 2 = Eliminado, 3 = No validado)
}
