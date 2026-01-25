/**
 * DTO para actualización de perfil
 * NO incluye email ni country (el backend no los acepta)
 */
export interface UpdateProfileDto {
  name?: string;
  lastname?: string;
  profileImage?: string;
  enterprise?: { name: string; url: string };
}
