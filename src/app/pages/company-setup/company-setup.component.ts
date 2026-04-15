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
import { UserService } from '../../core/services/user.service';
import { UserStorage } from '../../storages/user/user-storage';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../shared/modals/modal.service';
import { I18nService } from '../../core/services/i18n.service';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { UpgradePlanPricingViewComponent } from '../../shared/modals/upgrade-plan-modal/upgrade-plan-pricing-view.component';

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
  private route = inject(ActivatedRoute, { optional: true });
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

    if (standalone && currentUser?.planSelectionCompleted) {
      this.resumeAfterPlanSelection();
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
      }, 1000);
    }, 3000);
  }

  skipWelcome() {
    this.welcomeExitTriggered = true;
    setTimeout(() => {
      this.showWelcomeSequence = false;
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
      void this.authSession.clearSession().then(() => {
        void this.router.navigate(['/login'], { replaceUrl: true });
      });
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
      return;
    }

    if (this.displayedStep === step) {
      this.isStepFadingOut = false;
      if (this.stepFadeTimeout) {
        clearTimeout(this.stepFadeTimeout);
        this.stepFadeTimeout = null;
      }
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
      };
      reader.readAsDataURL(file);
      this.notificationService.success('Imagen cargada');
    }
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('logoUpload') as HTMLInputElement;
    fileInput?.click();
  }

  completeSetup() {
    this.isSetupActive = false;

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
