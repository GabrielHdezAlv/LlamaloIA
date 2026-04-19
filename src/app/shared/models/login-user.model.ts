export class LoginUser {
  email: string;
  password: string;
  /** Opcional: verificación de nuevo dispositivo en el backend */
  deviceId?: string;

  constructor(email: string, password: string, deviceId?: string) {
    this.email = email;
    this.password = password;
    if (deviceId) {
      this.deviceId = deviceId;
    }
  }
}
