import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import {
  ONBOARDING_STRIPE_CHECKOUT_PENDING_KEY,
  UpgradePlanPricingViewComponent,
} from '../../shared/modals/upgrade-plan-modal/upgrade-plan-pricing-view.component';

function onboardingCheckpointStorageKey(userId: string): string {
  return `llamalo_onboarding_ck_${userId}`;
}

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    UpgradePlanPricingViewComponent,
  ],
  templateUrl: './company-setup.component.html',
  styleUrl: './company-setup.component.scss',
})
export class CompanySetupComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private userStore = inject(UserStorage);
  private notificationService = inject(NotificationService);
  private modalService = inject(ModalService);
  private route = inject(ActivatedRoute);
  private i18nService = inject(I18nService);
  private authSession = inject(AuthSessionService);
  private router = inject(Router);

  get t() {
    return this.i18nService.getTranslations();
  }

  get canContinuePastPricing(): boolean {
    return this.userStore.user()?.planSelectionCompleted === true;
  }

  private isBrowser: boolean = false;

  businessName: string = 'LLAMALO S.L';
  selectedCompanyType: string = '';
  selectedEmployeeRange: string = '';

  companyTypes: Array<{ id: string; name: string }> = [
    { id: 'startup', name: 'Startup' },
    { id: 'small-business', name: 'Pequeña empresa' },
    { id: 'medium-business', name: 'Mediana empresa' },
    { id: 'large-corporation', name: 'Gran corporación' },
    { id: 'freelancer', name: 'Freelancer/Autónomo' },
    { id: 'non-profit', name: 'Organización sin ánimo de lucro' },
    { id: 'other', name: 'Otro' },
  ];

  employeeRanges: Array<{ id: string; range: string }> = [
    { id: '1', range: '1 empleado' },
    { id: '2-5', range: '2-5 empleados' },
    { id: '6-10', range: '6-10 empleados' },
    { id: '11-50', range: '11-50 empleados' },
    { id: '51-200', range: '51-200 empleados' },
    { id: '201-500', range: '201-500 empleados' },
    { id: '500+', range: 'Más de 500 empleados' },
  ];

  mainUsageOptions = [
    { id: 'customer-service', name: 'Atención al cliente' },
    { id: 'appointments', name: 'Agendar citas' },
    { id: 'cart-recovery', name: 'Recuperación de carritos' },
    { id: 'phone-sales', name: 'Ventas telefónicas' },
  ];

  selectedMainUsages: string[] = [];

  isMainUsageAnimating = false;
  mainUsageSelectedForTransition: string | null = null;
  selectedCardFadingOut = false;

  step2ContentVisible = true;

  private clickAudio: HTMLAudioElement | null = null;

  showWelcomeSequence = true;
  isWelcomeFading = false;
  welcomeExitTriggered = false;

  showPlanIntroAnimation = false;
  planIntroExitTriggered = false;

  selectedLogo: File | null = null;
  logoPreview: string | null = null;

  isSetupActive: boolean = false;

  currentStep: number = 1;
  maxStep = 4;
  displayedStep: number = 1;
  isStepFadingOut = false;
  private stepFadeTimeout: ReturnType<typeof setTimeout> | null = null;

  discoveryOptions = [
    {
      id: 'social',
      label: 'Redes sociales (Instagram / TikTok / Twitter / LinkedIn)',
    },
    { id: 'youtube', label: 'YouTube' },
    { id: 'google', label: 'Google / Buscando alternativas' },
    {
      id: 'communities',
      label: 'Comunidades / Grupos (Slack, Discord, Telegram)',
    },
    { id: 'events', label: 'Evento o webinar' },
    { id: 'friend', label: 'Recomendación de un amigo o colega' },
    { id: 'other-source', label: 'Otro' },
  ];

  selectedDiscoveryChannels: string[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    const path = this.router.url.split('?')[0];
    const standalone =
      path === '/company-setup' || path.startsWith('/company-setup/');
    this.isSetupActive = standalone;
    this.showWelcomeSequence = true;

    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      this.clickAudio = new Audio('assets/click.mp3');
    }
    const currentUser = this.userStore.user();
    if (currentUser?.profileImage) {
      this.logoPreview = currentUser.profileImage;
    }

    if (this.isBrowser) {
      document.body.classList.add('creating-agent');
    }

    const qp = this.route.snapshot.queryParamMap;
    const stripeCancel = qp.get('stripe') === 'cancel';
    let resumePricingStep = stripeCancel;
    if (!resumePricingStep && standalone && this.isBrowser) {
      try {
        if (
          sessionStorage.getItem(ONBOARDING_STRIPE_CHECKOUT_PENDING_KEY) ===
          '1'
        ) {
          resumePricingStep = true;
        }
      } catch {
        /* ignore */
      }
    }

    if (standalone && resumePricingStep) {
      try {
        sessionStorage.removeItem(ONBOARDING_STRIPE_CHECKOUT_PENDING_KEY);
      } catch {
        /* ignore */
      }
      this.skipWelcomeAndGoToPricingStep();
      void this.router.navigate(['/company-setup'], { replaceUrl: true });
      return;
    }

    if (standalone && currentUser?.planSelectionCompleted) {
      if (currentUser.userId) {
        this.clearOnboardingCheckpoint(currentUser.userId);
      }
      this.resumeAfterPlanSelection();
    } else if (
      standalone &&
      !currentUser?.planSelectionCompleted &&
      this.tryRestoreOnboardingCheckpoint()
    ) {
      return;
    }

    if (this.showWelcomeSequence) {
      this.startWelcomeSequence();
    }
  }

  ngOnDestroy() {
    if (this.stepFadeTimeout) {
      clearTimeout(this.stepFadeTimeout);
      this.stepFadeTimeout = null;
    }
    if (this.isBrowser) {
      document.body.classList.remove('creating-agent');
    }
  }

  private clearOnboardingCheckpoint(userId: string): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(onboardingCheckpointStorageKey(userId));
    } catch {
      /* ignore */
    }
  }

  private persistOnboardingCheckpoint(): void {
    if (!this.isBrowser) {
      return;
    }
    const uid = this.userStore.user()?.userId;
    if (!uid) {
      return;
    }
    if (this.userStore.user()?.hasCompletedSetup === true) {
      return;
    }
    try {
      localStorage.setItem(
        onboardingCheckpointStorageKey(uid),
        JSON.stringify({
          v: 1,
          currentStep: this.currentStep,
          displayedStep: this.displayedStep,
          welcomeDone: !this.showWelcomeSequence,
          selectedMainUsages: [...this.selectedMainUsages],
          selectedDiscoveryChannels: [...this.selectedDiscoveryChannels],
        }),
      );
    } catch {
      /* ignore */
    }
  }

  /**
   * Retoma paso y respuestas tras login o refresco (misma cuenta, mismo navegador).
   */
  private tryRestoreOnboardingCheckpoint(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    const uid = this.userStore.user()?.userId;
    if (!uid) {
      return false;
    }
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(onboardingCheckpointStorageKey(uid));
    } catch {
      return false;
    }
    if (!raw) {
      return false;
    }
    try {
      const s = JSON.parse(raw) as {
        v: number;
        currentStep: number;
        welcomeDone?: boolean;
        selectedMainUsages?: string[];
        selectedDiscoveryChannels?: string[];
      };
      if (s.v !== 1) {
        return false;
      }
      if (s.currentStep < 1 || s.currentStep > this.maxStep) {
        return false;
      }
      if (s.currentStep === 1 && s.welcomeDone !== true) {
        return false;
      }
      this.showWelcomeSequence = false;
      this.welcomeExitTriggered = true;
      this.showPlanIntroAnimation = false;
      this.planIntroExitTriggered = false;
      this.selectedMainUsages = [...(s.selectedMainUsages || [])];
      this.selectedDiscoveryChannels = [...(s.selectedDiscoveryChannels || [])];
      this.goToStep(s.currentStep, { instant: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Vuelta desde Stripe sin completar pago: ir al paso de planes sin animación inicial
   * ni reinicio desde el paso 1 (evita flash del dashboard si la cancel URL apunta aquí).
   */
  private skipWelcomeAndGoToPricingStep(): void {
    this.showWelcomeSequence = false;
    this.welcomeExitTriggered = true;
    this.showPlanIntroAnimation = false;
    this.planIntroExitTriggered = false;
    this.goToStep(3, { instant: true });
  }

  /** Usuario ya completó pago/trial: ir directo a la pantalla final de bienvenida. */
  resumeAfterPlanSelection(): void {
    this.showWelcomeSequence = false;
    this.welcomeExitTriggered = true;
    this.showPlanIntroAnimation = false;
    this.goToStep(4, { instant: true });
  }

  toggleSetup() {
    this.isSetupActive = !this.isSetupActive;
    if (this.isSetupActive) {
      this.currentStep = 1;
      this.displayedStep = 1;
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
      this.step2ContentVisible = true;
      this.showWelcomeSequence = true;
      this.welcomeExitTriggered = false;
      this.startWelcomeSequence();
    }
  }

  playClick() {
    if (!this.clickAudio) return;
    try {
      this.clickAudio.currentTime = 0;
      this.clickAudio.play();
    } catch {
      /* ignore */
    }
  }

  startWelcomeSequence() {
    setTimeout(() => {
      this.welcomeExitTriggered = true;
      setTimeout(() => {
        this.showWelcomeSequence = false;
        this.persistOnboardingCheckpoint();
      }, 1000);
    }, 3000);
  }

  skipWelcome() {
    this.welcomeExitTriggered = true;
    setTimeout(() => {
      this.showWelcomeSequence = false;
      this.persistOnboardingCheckpoint();
    }, 200);
  }

  /** Tras paso 2: animación y paso 3 (planes). */
  startPlanIntroAnimation() {
    this.goToStep(3, { instant: true });
    this.showPlanIntroAnimation = true;
    this.planIntroExitTriggered = false;
    setTimeout(() => {
      this.planIntroExitTriggered = true;
      setTimeout(() => {
        this.showPlanIntroAnimation = false;
        this.persistOnboardingCheckpoint();
      }, 1000);
    }, 3000);
  }

  continueSetup() {
    this.goToStep(this.currentStep + 1);
  }

  selectMainUsage(usageId: string) {
    const index = this.selectedMainUsages.indexOf(usageId);
    if (index > -1) {
      this.selectedMainUsages.splice(index, 1);
    } else {
      this.selectedMainUsages.push(usageId);
    }
    this.persistOnboardingCheckpoint();
  }

  handleMainUsageClick(usageId: string) {
    if (this.isMainUsageAnimating) {
      return;
    }
    this.selectedMainUsages = [usageId];
    this.mainUsageSelectedForTransition = usageId;
    this.isMainUsageAnimating = true;
    this.selectedCardFadingOut = false;
    this.step2ContentVisible = false;

    const selectedVisibleDelay = 550;
    const selectedFadeOutDuration = 250;
    const step2DelayAfterFade = 200;

    setTimeout(() => {
      this.selectedCardFadingOut = true;

      setTimeout(() => {
        this.goToStep(2);

        setTimeout(() => {
          this.step2ContentVisible = true;
          this.isMainUsageAnimating = false;
          this.mainUsageSelectedForTransition = null;
          this.selectedCardFadingOut = false;
        }, step2DelayAfterFade);
      }, selectedFadeOutDuration);
    }, selectedVisibleDelay);
  }

  toggleDiscoveryChannel(channelId: string) {
    const index = this.selectedDiscoveryChannels.indexOf(channelId);
    if (index > -1) {
      this.selectedDiscoveryChannels.splice(index, 1);
    } else {
      this.selectedDiscoveryChannels.push(channelId);
    }
    this.persistOnboardingCheckpoint();
  }

  skipSetup() {
    if (this.currentStep === 1) {
      this.goToStep(2);
    } else if (this.currentStep === 2) {
      this.startPlanIntroAnimation();
    } else if (this.currentStep === 4) {
      this.completeSetup();
    }
  }

  goBack() {
    if (this.currentStep === 1) {
      void this.abandonIncompleteRegistrationAndGoToLogin();
      return;
    }

    if (this.currentStep === 2) {
      const backFadeDuration = 200;
      this.step2ContentVisible = false;
      setTimeout(() => {
        this.goToStep(1);
      }, backFadeDuration);
      return;
    }

    if (this.currentStep === 3) {
      this.goToStep(2);
      return;
    }

    if (this.currentStep === 4) {
      this.goToStep(3);
      return;
    }

    this.goToStep(this.currentStep - 1);
  }

  goToStep(step: number, options?: { instant?: boolean }) {
    if (step < 1) step = 1;
    if (step > this.maxStep) step = this.maxStep;

    if (step === 2) {
      this.step2ContentVisible = true;
    }

    this.currentStep = step;

    if (options?.instant) {
      this.displayedStep = step;
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
      this.persistOnboardingCheckpoint();
      return;
    }

    if (this.displayedStep === step) {
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
      this.persistOnboardingCheckpoint();
      return;
    }

    this.isStepFadingOut = true;
    if (this.stepFadeTimeout) {
      clearTimeout(this.stepFadeTimeout);
    }
    this.stepFadeTimeout = setTimeout(() => {
      this.displayedStep = step;
      this.isStepFadingOut = false;
      this.stepFadeTimeout = null;
      this.persistOnboardingCheckpoint();
    }, 250);
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.notificationService.error(
          'Por favor, selecciona un archivo de imagen válido',
        );
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.error('La imagen debe ser menor a 10MB');
        return;
      }
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
        this.persistOnboardingCheckpoint();
      };
      reader.readAsDataURL(file);
      this.notificationService.success('Imagen cargada');
    }
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Abandono explícito del onboarding (paso 1 → login): elimina cuenta incompleta en API
   * si aún no hay plan/setup completado, igual que «Cancelar registro» en planes.
   */
  private async abandonIncompleteRegistrationAndGoToLogin(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    try {
      sessionStorage.removeItem(ONBOARDING_STRIPE_CHECKOUT_PENDING_KEY);
    } catch {
      /* ignore */
    }

    const user = this.userStore.user();
    if (user?.userId) {
      this.clearOnboardingCheckpoint(user.userId);
    }
    const canDeleteIncomplete =
      user &&
      user.hasCompletedSetup !== true &&
      user.planSelectionCompleted !== true;

    if (canDeleteIncomplete) {
      try {
        await firstValueFrom(this.userService.cancelIncompleteRegistration());
      } catch {
        /* Sin token, cuenta ya borrada o error de red: cerramos sesión local igualmente */
      }
    }

    this.authSession.signOutAndReload();
  }

  completeSetup() {
    this.isSetupActive = false;
    const uid = this.userStore.user()?.userId;
    if (uid) {
      this.clearOnboardingCheckpoint(uid);
    }

    this.userService.updateUserProfile({ hasCompletedSetup: true }).subscribe({
      next: () => {
        const currentUser = this.userStore.user();
        if (currentUser) {
          this.userStore.setUser({
            ...currentUser,
            hasCompletedSetup: true,
          });
        }
        void this.router.navigate(['/dashboard/home']);
      },
      error: () => {
        const currentUser = this.userStore.user();
        if (currentUser) {
          this.userStore.setUser({
            ...currentUser,
            hasCompletedSetup: true,
          });
        }
        void this.router.navigate(['/dashboard/home']);
      },
    });
  }
}
