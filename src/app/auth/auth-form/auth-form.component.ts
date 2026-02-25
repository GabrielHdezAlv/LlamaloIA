import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { log } from 'console';
import { ModalService } from '../../shared/modals/modal.service';
import { AnimatedCheckboxComponent } from '../../shared/components/animated-checkbox/animated-checkbox.component';
import { ACCOUNT_STATUS } from '../../shared/models/account-status.enum';
import { USER_ROLE } from '../../shared/models/user-role.enum';
import { I18nService, Language } from '../../core/services/i18n.service';

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

  // Campos del formulario
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  fullName: string = '';
  country: string = ''; // ✅ NUEVO - Requerido
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

  get title(): string {
    return this.type === 'login' ? this.t.authWelcomeBack
      : this.type === 'register' ? this.t.authWelcomeBack
      : this.t.authLoginTitle;
  }
  get formTitle(): string {
    return this.type === 'login' ? this.t.authLoginTitle
      : this.type === 'register' ? this.t.authLoginTitle
      : this.t.authLoginTitle;
  }
  get formSubtitle(): string {
    return this.t.authLoginSubtitle;
  }
  get buttonText(): string {
    return this.type === 'login' ? this.t.authLoginButton
      : this.type === 'register' ? this.t.authLoginButton
      : this.t.authLoginButton;
  }
  get subtitle(): string { return ''; }
  get linkText(): string { return ''; }
  get bottomText(): string { return ''; }
  get bottomLinkText(): string { return ''; }

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

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.type = data['type'];
      this.linkRoute = data['linkRoute'] ?? '';
      this.bottomLinkRoute = data['bottomLinkRoute'] ?? '';
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

    this.userService.LoginUser(user).subscribe({
      next: (response) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('token', response.token);
        }
        this.userService.getUserProfile().subscribe({
          next: (data: any) => {
            this.userStorage.setUser(data);
            // Actualizar TwilioStorage si viene en el perfil
            // Usar la primera cuenta de Twilio para compatibilidad con el storage actual
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

            // Mostrar notificación pill de éxito
            this.notificationService.success(this.t.authSuccessLogin);

            // Redirigir según rol: owner → /admin, resto → /dashboard
            const redirectUrl = data.rol === USER_ROLE.OWNER ? '/admin' : '/dashboard';
            setTimeout(() => {
              this.router.navigate([redirectUrl]);
            }, 2000);
          },
          error: (err) => {
            console.error('Error al obtener perfil', err);
            this.notificationService.error(this.t.authErrorGetProfile);
          },
        });
      },
      error: (err) => {
        console.error('❌ Error en inicio de sesión:', err);
        this.notificationService.error(this.t.authErrorLogin);
      },
    });
  }


  register(event: Event) {
    event.preventDefault();

    // Validar campos antes de registrar
    if (!this.fullName || !this.email || !this.password || !this.country) {
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
      country: this.country, // NUEVO - Requerido
      marketingConsent: this.marketingConsent, // NUEVO - Requerido
      accountStatus: ACCOUNT_STATUS.UNVERIFIED, // NUEVO: Por defecto No validado (3) para nuevos usuarios hasta que verifiquen email
      rol: USER_ROLE.CLIENT_USER, // ⬅️ NUEVO: Por defecto client_user para nuevos registros
    };

    this.userService.RegisterUser(user).subscribe({
      next: (response) => {
        // Mostrar notificación de validación de correo
        this.notificationService.info(this.t.authSuccessVerifyEmail);

        // Redirigir a login después de un breve delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.notificationService.error(this.t.authErrorRegister);
      },
    });
  }

  recover(event: Event) {
    event.preventDefault();
    if (!this.email) {
      this.notificationService.error(this.t.authErrorRecoverEmail);
      return;
    }
    // Aquí se podría llamar a un endpoint real de recuperación
    this.notificationService.success(this.t.authSuccessRecover);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
