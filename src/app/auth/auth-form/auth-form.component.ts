import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginUser } from '../../shared/models/login-user.model';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../shared/modals/modal.service';
import { AnimatedCheckboxComponent } from '../../shared/components/animated-checkbox/animated-checkbox.component';
import { ACCOUNT_STATUS } from '../../shared/models/account-status.enum';
import { USER_ROLE } from '../../shared/models/user-role.enum';
import { I18nService, Language } from '../../core/services/i18n.service';
import { take } from 'rxjs/operators';
import { FirebaseTokenRefreshService } from '../../core/services/firebase-token-refresh.service';
import { environment } from '../../../environments/environment';
import { isLocalAuthRegistrationHost } from '../../core/utils/auth-host-features';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleProvider } from '../../core/services/firebase.config';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    AnimatedCheckboxComponent,
  ],
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
})
export class AuthFormComponent implements OnInit {
  type: 'login' | 'register' | 'recover' = 'login';
  linkRoute: string = '';
  bottomLinkRoute: string = '';
  subtitle: string = '';
  linkText: string = '';
  bottomText: string = '';
  bottomLinkText: string = '';

  private routeTitle?: string;
  private routeFormTitle?: string;
  private routeFormSubtitle?: string;
  private routeButtonText?: string;

  // Campos del formulario
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  fullName: string = '';
  marketingConsent: boolean = false; // ✅ NUEVO - Requerido

  // Estado para mostrar/ocultar contraseña
  showPassword: boolean = false;

  // Estado para recordar sesión
  rememberMe: boolean = false;

  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);
  private i18nService = inject(I18nService);

  languages = this.i18nService.getAvailableLanguages();
  get selectedLanguage() {
    return this.i18nService.selectedLanguage();
  }
  selectLanguage(lang: Language) {
    this.i18nService.setLanguage(lang);
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  /** Registro y Google solo en localhost (no en dev/preprod/app). */
  get authLocalFeatures(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return isLocalAuthRegistrationHost();
  }

  get title(): string {
    if (this.routeTitle !== undefined && this.routeTitle !== '') {
      return this.routeTitle;
    }
    switch (this.type) {
      case 'register':
        return this.t.authWelcomeRegister;
      case 'recover':
        return this.t.authWelcomeRecover;
      default:
        return this.t.authWelcomeBack;
    }
  }
  get formTitle(): string {
    if (this.routeFormTitle !== undefined && this.routeFormTitle !== '') {
      return this.routeFormTitle;
    }
    switch (this.type) {
      case 'register':
        return this.t.authRegisterTitle;
      case 'recover':
        return this.t.authRecoverTitle;
      default:
        return this.t.authLoginTitle;
    }
  }
  get formSubtitle(): string {
    if (this.routeFormSubtitle !== undefined && this.routeFormSubtitle !== '') {
      return this.routeFormSubtitle;
    }
    switch (this.type) {
      case 'register':
        return this.t.authRegisterSubtitle;
      case 'recover':
        return this.t.authRecoverSubtitle;
      default:
        return this.t.authLoginSubtitle;
    }
  }
  get buttonText(): string {
    if (this.routeButtonText !== undefined && this.routeButtonText !== '') {
      return this.routeButtonText;
    }
    switch (this.type) {
      case 'register':
        return this.t.authRegisterButton;
      case 'recover':
        return this.t.authRecoverButton;
      default:
        return this.t.authLoginButton;
    }
  }

  get countries() {
    const t = this.t;
    return [
      { code: 'ES', name: t.authCountryES },
      { code: 'FR', name: t.authCountryFR },
      { code: 'IT', name: t.authCountryIT },
      { code: 'PT', name: t.authCountryPT },
      { code: 'DE', name: t.authCountryDE },
      { code: 'GB', name: t.authCountryGB },
      { code: 'US', name: t.authCountryUS },
      { code: 'MX', name: t.authCountryMX },
      { code: 'AR', name: t.authCountryAR },
      { code: 'CO', name: t.authCountryCO },
    ];
  }

  private router = inject(Router);
  private modalService = inject(ModalService);
  private platformId = inject(PLATFORM_ID);
  private firebaseTokenRefresh = inject(FirebaseTokenRefreshService);

  constructor(private route: ActivatedRoute) { }

  private applyRouteData(data: Data): void {
    this.type = (data['type'] as 'login' | 'register' | 'recover') ?? 'login';
    this.linkRoute = data['linkRoute'] ?? '';
    this.bottomLinkRoute = data['bottomLinkRoute'] ?? '';
    this.subtitle = data['subtitle'] ?? '';
    this.linkText = data['linkText'] ?? '';
    this.bottomText = data['bottomText'] ?? '';
    this.bottomLinkText = data['bottomLinkText'] ?? '';
    this.routeTitle = data['title'];
    this.routeFormTitle = data['formTitle'];
    this.routeFormSubtitle = data['formSubtitle'];
    this.routeButtonText = data['buttonText'];
  }

  ngOnInit(): void {
    this.applyRouteData(this.route.snapshot.data);
    this.route.data.subscribe((data) => this.applyRouteData(data));

    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (
        isPlatformBrowser(this.platformId) &&
        params['verify'] === '1' &&
        params['email']
      ) {
        const em = String(params['email']);
        this.email = em;
        setTimeout(() => {
          this.modalService.openEmailVerification({ email: em });
        }, 400);
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { verify: null, email: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  submit(event: Event) {
    switch (this.type) {
      case 'login':
        this.login(event);
        break;
      case 'register':
        this.register(event);
        break;
      case 'recover':
        this.recover(event);
        break;
    }
  }

  login(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.notificationService.error(this.t.authErrorEmailPassword);
      return;
    }

    const user = new LoginUser(this.email, this.password);
    this.setGlobalLoading(true);

    this.userService.LoginUser(user).subscribe({
      next: (response: { token: string; refreshToken?: string }) => {
        if (environment.production && environment.deployEnvLabel == null) {
          console.log('Bienvenido a producción');
        }
        this.firebaseTokenRefresh.persistSessionTokensFromApi(response);
        this.firebaseTokenRefresh.start();
        this.loadProfileAndNavigate();
      },
      error: (err: { status?: number; error?: { message?: string } }) => {
        console.error('❌ Error en inicio de sesión:', err);
        const msg = String(err?.error?.message ?? '');
        const lower = msg.toLowerCase();
        if (
          err?.status === 401 &&
          (lower.includes('verificar') ||
            lower.includes('verify') ||
            lower.includes('verification'))
        ) {
          this.notificationService.info(
            this.t.authSuccessVerifyEmail ||
              'Introduce el código que te enviamos por correo para activar la cuenta.',
          );
          setTimeout(() => {
            if (isPlatformBrowser(this.platformId)) {
              this.modalService.openEmailVerification({
                email: this.email,
                password: this.password,
              });
            }
          }, 400);
          this.setGlobalLoading(false);
          return;
        }
        this.notificationService.error(this.t.authErrorLogin);
        this.setGlobalLoading(false);
      },
    });
  }

  // Factorizado de cargar perfil y navegar tras login con email
  private loadProfileAndNavigate() {
    this.userService.getUserProfile().subscribe({
      next: (data: any) => {
        this.userStorage.setUser(data);
        if (
          data.twilio &&
          Array.isArray(data.twilio) &&
          data.twilio.length > 0
        ) {
          const firstAccount = data.twilio[0];
          this.twilioStorage.setConfig({
            twilioAccountId: firstAccount.twilioAccountId,
            twilioSid: firstAccount.twilioSid,
            twilioToken: firstAccount.twilioToken,
          });
        }

        this.notificationService.success(this.t.authSuccessLogin);

        const redirectUrl =
          data.rol === USER_ROLE.OWNER ? '/admin/agents/edit/1' : '/dashboard';
        setTimeout(() => {
          this.router.navigate([redirectUrl]);
          this.setGlobalLoading(false);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al obtener perfil', err);
        this.notificationService.error(this.t.authErrorGetProfile);
        this.setGlobalLoading(false);
      },
    });
  }


  register(event: Event) {
    event.preventDefault();

    // Validar campos antes de registrar
    if (!this.fullName || !this.email || !this.password) {
      this.notificationService.error(this.t.authErrorFillAll);
      return;
    }

    if (!this.marketingConsent) {
      this.notificationService.error(this.t.authErrorMarketingConsent);
      return;
    }

    // Realizar registro directamente
    this.completeRegistration();
  }

  private completeRegistration() {
    var user = {
      name: this.fullName.split(' ')[0],
      lastname: this.fullName.split(' ')[1] || '',
      email: this.email,
      password: this.password,
      country: '',
      marketingConsent: this.marketingConsent, // NUEVO - Requerido
      accountStatus: ACCOUNT_STATUS.UNVERIFIED, // NUEVO: Por defecto No validado (3) para nuevos usuarios hasta que verifiquen email
      rol: USER_ROLE.CLIENT_USER, // ⬅️ NUEVO: Por defecto client_user para nuevos registros
    };

    this.userService.RegisterUser(user).subscribe({
      next: (res: {
        verificationEmailSent?: boolean;
        token?: string;
        refreshToken?: string;
      }) => {
        if (res?.token) {
          this.firebaseTokenRefresh.persistSessionTokensFromApi({
            token: res.token,
            refreshToken: res.refreshToken,
          });
          this.firebaseTokenRefresh.start();
        }
        setTimeout(() => {
          if (!isPlatformBrowser(this.platformId)) {
            return;
          }
          const ref = this.modalService.openRegistrationPlanGate();
          ref.afterClosed().subscribe((result: string | undefined) => {
            if (result === 'email_next') {
              if (res?.verificationEmailSent === false) {
                this.notificationService.warning(
                  'No pudimos enviar el correo de verificación. Usa «Reenviar código» en la ventana que se abre o revisa la carpeta de spam. Si el problema continúa, contacta con soporte.',
                );
              } else {
                this.notificationService.info(
                  'Revisa tu correo para el código de verificación.',
                );
              }
              this.modalService.openEmailVerification({ email: this.email });
            }
          });
        }, 400);
      },
      error: (err) => {
        this.notificationService.error(this.t.authErrorRegister);
      },
    });
  }

  recover(event: Event) {
    event.preventDefault();
    if (!this.email?.trim()) {
      this.notificationService.error(this.t.authErrorRecoverEmail);
      return;
    }
    this.setGlobalLoading(true);
    this.userService.requestPasswordReset(this.email.trim()).subscribe({
      next: () => {
        this.notificationService.success(this.t.authSuccessRecover);
        this.setGlobalLoading(false);
      },
      error: (err: { error?: { message?: string }; message?: string }) => {
        console.error('❌ Error solicitud recuperación:', err);
        const msg =
          (typeof err?.error?.message === 'string' && err.error.message) ||
          (typeof err?.message === 'string' && err.message) ||
          this.t.authErrorRecoverRequest;
        this.notificationService.error(msg);
        this.setGlobalLoading(false);
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    if (!this.authLocalFeatures) {
      return;
    }
    this.setGlobalLoading(true);
    signInWithPopup(firebaseAuth, googleProvider)
      .then((cred) => cred.user.getIdToken())
      .then((idToken) => {
        this.userService.LoginWithGoogle(idToken).subscribe({
          next: (response: { token: string; refreshToken?: string }) => {
            this.firebaseTokenRefresh.persistSessionTokensFromApi(response);
            this.firebaseTokenRefresh.start();
            this.loadProfileAndNavigate();
          },
          error: () => {
            this.notificationService.error(this.t.authErrorGoogleLogin);
            this.setGlobalLoading(false);
          },
        });
      })
      .catch((err: { code?: string }) => {
        const code = err?.code ?? '';
        if (
          code === 'auth/popup-closed-by-user' ||
          code === 'auth/cancelled-popup-request'
        ) {
          this.setGlobalLoading(false);
          return;
        }
        console.error('Google sign-in:', err);
        this.notificationService.error(this.t.authErrorGoogleLogin);
        this.setGlobalLoading(false);
      });
  }

  private setGlobalLoading(isLoading: boolean) {
    if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
      window.dispatchEvent(
        new CustomEvent<boolean>('global-loading', { detail: isLoading }),
      );
    }
  }
}
