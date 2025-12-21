/**
 * DTO para registro de usuario
 * Solo acepta estos 4 campos según el backend
 */
export interface CreateUserDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

