import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LoginUser } from '../../shared/models/login-user.model';
import { CreateUserDto } from '../../shared/models/create-user-dto.model';
import { UpdateProfileDto } from '../../shared/models/update-profile-dto.model';
import { UserProfileResponseDto } from '../../shared/models/user-profile-response.dto';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /** Base URL del backend (HTTP); misma base para WebSocket de perfil. */
  getApiBaseUrl(): string {
    return this.apiUrl;
  }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  private getFileUploadHeaders(): HttpHeaders {
    let token = '';
    if (
      this.isBrowser &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      Accept: '*/*',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Obtener lista de números de teléfono del usuario autenticado
   * Endpoint: GET /users/phone-numbers
   * Query param opcional: q
   *
   * Estructura esperada de respuesta:
   * {
   *   phoneNumbers: Array<{
   *     phoneId: number;
   *     countryCode: string;
   *     number: string;
   *     state: "Activo" | "Inactivo";
   *     importedBy: string;
   *   }>
   * }
   */
  getUserPhoneNumbers(q?: string): Observable<{
    phoneNumbers: Array<{
      phoneId: number;
      countryCode: string;
      number: string;
      state: 'Activo' | 'Inactivo';
      importedBy: string;
    }>;
  }> {
    const hasQuery = q && q.trim().length > 0;

    const options: {
      headers: HttpHeaders;
      params?: { q: string };
    } = {
      headers: this.getAuthHeaders(),
      ...(hasQuery ? { params: { q: q!.trim() } } : {}),
    };

    return this.http.get<{
      phoneNumbers: Array<{
        phoneId: number;
        countryCode: string;
        number: string;
        state: 'Activo' | 'Inactivo';
        importedBy: string;
      }>;
    }>(`${this.apiUrl}/users/phone-numbers`, options);
  }

  LoginUser(user: LoginUser): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, user, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Login con Google
  LoginWithGoogle(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, { token }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*'
      }),
    });
  }

  getUserProfile(): Observable<UserProfileResponseDto> {
    return this.http.get<UserProfileResponseDto>(
      `${this.apiUrl}/users/profile`,
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  RegisterUser(newUser: CreateUserDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, newUser, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUserProfile(
    userData: UpdateProfileDto,
    imageFile?: File,
  ): Observable<any> {
    if (imageFile) {
      // Usar FormData para actualización completa con imagen
      const formData = new FormData();
      formData.append('name', userData.name || '');
      formData.append('lastname', userData.lastname || '');
      formData.append('country', userData.country || '');
      formData.append(
        'marketingConsent',
        String(userData.marketingConsent || false),
      );

      if (userData.hasCompletedSetup !== undefined) {
        formData.append(
          'hasCompletedSetup',
          String(userData.hasCompletedSetup),
        );
      }

      if (userData.enterprise) {
        formData.append('enterprise[name]', userData.enterprise.name || '');
        formData.append('enterprise[url]', userData.enterprise.url || '');
      }

      formData.append('image', imageFile);

      return this.http
        .put<any>(`${this.apiUrl}/users/profile`, formData, {
          headers: this.getFileUploadHeaders(),
        })
        .pipe(
          map((response) => {
            // Agregar timestamp para evitar caché si hay una nueva imagen
            if (
              response &&
              response.profileImage &&
              response.profileImage.startsWith('http')
            ) {
              response.profileImage = `${response.profileImage}?t=${Date.now()}`;
            }
            return response;
          }),
        );
    } else {
      // Usar JSON para actualización de perfil sin imagen
      return this.http.put<any>(`${this.apiUrl}/users/profile`, userData, {
        headers: this.getAuthHeaders(),
      });
    }
  }

  uploadProfileImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<any>(`${this.apiUrl}/users/profile/image`, formData, {
      headers: this.getFileUploadHeaders(),
    });
  }

  // IDIOMAS
  getLanguages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/languages/allLanguages`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Cambiar contraseña
  changePassword(
    newPassword: string,
    confirmPassword: string,
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/auth/change-password`,
      {
        newPassword,
        confirmPassword,
      },
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // Eliminar cuenta (programada)
  deleteAccount(): Observable<{
    message: string;
    scheduledDeletionDate: string;
  }> {
    return this.http.delete<{ message: string; scheduledDeletionDate: string }>(
      `${this.apiUrl}/users/account`,
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // ✅ CAMBIAR PLAN (Mock Stripe / Update DB)
  changePlan(planType: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/users/plan`,
      { plan: planType },
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ CANJEAR RECOMPENSA
  redeemReward(rewardType: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/users/rewards/redeem`,
      { rewardType },
      { headers: this.getAuthHeaders() }
    );
  }

  // Verificar email
  verifyEmail(
    token: string,
  ): Observable<{ message: string; accountStatus: number }> {
    return this.http.post<{ message: string; accountStatus: number }>(
      `${this.apiUrl}/auth/verify-email`,
      { token },
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  // Reenviar email de verificación
  resendVerificationEmail(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/resend-verification`,
      { email },
      {
        headers: this.getAuthHeaders(),
      }
    );
  }
}
