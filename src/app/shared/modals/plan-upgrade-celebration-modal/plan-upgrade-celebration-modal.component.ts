import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import confetti from 'canvas-confetti';
import { I18nService } from '../../../core/services/i18n.service';
import type { PaidUpgradePlanId } from '../upgrade-plan-modal/pricing-plan-features';

export type PlanUpgradeCelebrationPlan = PaidUpgradePlanId;

export interface PlanUpgradeCelebrationModalData {
  plan: PlanUpgradeCelebrationPlan;
}

const CELEBRATION_MODAL_CLOSE_MS = 420;

/** Azules marca / variación para todo el confeti. */
const CONFETTI_BLUE_COLORS = [
  '#0a1740',
  '#1B2559',
  '#1e3a8a',
  '#1d4ed8',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
];

/** Intervalo entre ráfagas del confeti (ms). */
const CONFETTI_LOOP_MS = 900;

/** Segunda ráfaga tras la inicial (ms). */
const CONFETTI_SECOND_BURST_MS = 160;

@Component({
  selector: 'app-plan-upgrade-celebration-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './plan-upgrade-celebration-modal.component.html',
  styleUrls: ['./plan-upgrade-celebration-modal.component.scss'],
  host: { class: 'block w-full min-w-0 box-border' },
})
export class PlanUpgradeCelebrationModalComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly planData = inject<PlanUpgradeCelebrationModalData>(MAT_DIALOG_DATA);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  dialogRef = inject(MatDialogRef<PlanUpgradeCelebrationModalComponent>);
  private readonly destroy$ = new Subject<void>();
  private readonly modalShell = viewChild<ElementRef<HTMLElement>>('modalShell');
  private readonly confettiCanvas = viewChild<ElementRef<HTMLCanvasElement>>('confettiCanvas');
  /** En navegador es `number`; con @types/node el typing de timers difiere. */
  private confettiLoopIntervalId: number | null = null;
  private confettiFire:
    | ((options?: Parameters<ReturnType<typeof confetti.create>>[0]) => Promise<null | undefined>)
    | null = null;
  private closing = false;

  get t() {
    return this.i18nService.getTranslations();
  }

  get celebrationTitle(): string {
    switch (this.planData.plan) {
      case 'starter':
        return this.t.planUpgradeCelebrationTitleStarter;
      case 'growth':
        return this.t.planUpgradeCelebrationTitleGrowth;
      case 'scale':
        return this.t.planUpgradeCelebrationTitleScale;
    }
  }

  get celebrationMessage(): string {
    switch (this.planData.plan) {
      case 'starter':
        return this.t.planUpgradeCelebrationMessageStarter;
      case 'growth':
        return this.t.planUpgradeCelebrationMessageGrowth;
      case 'scale':
        return this.t.planUpgradeCelebrationMessageScale;
    }
  }

  ngOnInit(): void {
    document.body.classList.add('plan-celebration-modal-open');

    this.dialogRef
      .backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.closeWithAnimation());

    this.dialogRef
      .keydownEvents()
      .pipe(
        takeUntil(this.destroy$),
        filter((e): e is KeyboardEvent => e.key === 'Escape'),
      )
      .subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeWithAnimation();
      });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.confettiCanvas()?.nativeElement) {
      this.launchConfetti();
    } else {
      requestAnimationFrame(() => this.launchConfetti());
    }
  }

  ngOnDestroy(): void {
    this.stopConfettiLoop();
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('plan-celebration-modal-open');
    document.body.classList.remove('plan-celebration-modal-leaving');
  }

  goToDashboard(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    const el = this.modalShell()?.nativeElement;
    el?.classList.add('plan-celebration-shell--leave');
    document.body.classList.add('plan-celebration-modal-leaving');
    setTimeout(() => {
      document.body.classList.remove('plan-celebration-modal-leaving');
      this.dialogRef.close('dashboard');
      void this.router.navigate(['/dashboard']);
    }, CELEBRATION_MODAL_CLOSE_MS);
  }

  private closeWithAnimation(): void {
    if (this.closing) {
      return;
    }
    this.closing = true;
    const el = this.modalShell()?.nativeElement;
    el?.classList.add('plan-celebration-shell--leave');
    document.body.classList.add('plan-celebration-modal-leaving');
    setTimeout(() => {
      document.body.classList.remove('plan-celebration-modal-leaving');
      this.dialogRef.close();
    }, CELEBRATION_MODAL_CLOSE_MS);
  }

  private launchConfetti(): void {
    if (typeof globalThis.matchMedia === 'function') {
      const reduce = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
      if (reduce.matches) {
        return;
      }
    }

    const canvas = this.confettiCanvas()?.nativeElement;
    if (!canvas) {
      return;
    }

    const fire = confetti.create(canvas, { resize: true, useWorker: false });
    this.confettiFire = fire;

    const colors = CONFETTI_BLUE_COLORS;

    const burst = (): void => {
      const slow = {
        particleCount: 32,
        spread: 52,
        startVelocity: 17,
        gravity: 0.72,
        decay: 0.92,
        drift: 0.04,
        colors,
      } as const;
      void fire({
        ...slow,
        origin: { x: 0.1, y: 0.05 },
      });
      void fire({
        ...slow,
        origin: { x: 0.9, y: 0.05 },
      });
      void fire({
        ...slow,
        particleCount: 44,
        spread: 64,
        startVelocity: 14,
        origin: { x: 0.5, y: 0.08 },
      });
    };

    burst();
    window.setTimeout(burst, CONFETTI_SECOND_BURST_MS);

    this.confettiLoopIntervalId = window.setInterval(() => {
      burst();
    }, CONFETTI_LOOP_MS) as unknown as number;
  }

  private stopConfettiLoop(): void {
    if (this.confettiLoopIntervalId !== null) {
      window.clearInterval(this.confettiLoopIntervalId);
      this.confettiLoopIntervalId = null;
    }
    const fire = this.confettiFire as { reset?: () => void } | null;
    fire?.reset?.();
    this.confettiFire = null;
  }
}
