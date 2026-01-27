/**
 * DTO para actualización de perfil
 * Campos opcionales para actualizar el perfil
 */
export interface UpdateProfileDto {
  name?: string;
  lastname?: string;
  profileImage?: string;
  enterprise?: { name: string; url: string };
  country?: string;          // ✅ NUEVO - Opcional
  marketingConsent?: boolean; // ✅ NUEVO - Opcional
}
