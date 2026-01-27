/**
 * DTO para registro de usuario
 * Campos requeridos para el registro
 */
export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
  country: string;          // ✅ NUEVO - Requerido
  marketingConsent: boolean; // ✅ NUEVO - Requerido
}

