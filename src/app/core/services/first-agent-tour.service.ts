import { Injectable, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { driver, type Driver, type PopoverDOM } from 'driver.js';
import { UserStorage } from '../../storages/user/user-storage';
import { I18nService } from './i18n.service';
import { User } from '../../shared/models/new-user.model';
import {
  FIRST_AGENT_TOUR_SESSION_KEY,
  FIRST_AGENT_TOUR_HOME_READY_KEY,
  PLAN_CELEBRATION_REQUIRED_KEY,
  PLAN_CELEBRATION_ACCEPTED_KEY,
  firstAgentTourSkippedKey,
  firstAgentTourMilestoneKey,
} from '../constants/first-agent-tour.constants';
import { requiresSubscriptionPaywall } from '../../shared/utils/plan-usage.util';

/**
 * Tour spotlight (driver.js) para guiar al usuario a Agentes → Agregar agente la primera vez.
 * - «Saltar» o cerrar (X): no vuelve a mostrarse (localStorage por usuario).
 * - Crear el primer agente (aunque luego se borre): tampoco vuelve a mostrarse (marca persistente).
 */
@Injectable({ providedIn: 'root' })
export class FirstAgentTourService {
  private router = inject(Router);
  private userStorage = inject(UserStorage);
  private i18n = inject(I18nService);
  private platformId = inject(PLATFORM_ID);

  private activeDriver: Driver | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    /** Si el perfil indica que ya hay agentes, persistir hito (cubre login con cuenta antigua o sync tardío). */
    effect(() => {
      const user = this.userStorage.user();
      const uid = user?.userId;
      if (!uid || !user) return;
      if (this.userHasAgents(user) && !this.isMilestoneDone(uid)) {
        this.markFirstAgentMilestone(uid);
      }
    });
    /** Al ir a crear/editar agente el paso «Agregar agente» ya no aplica: cerrar overlay del tour */
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const path = e.urlAfterRedirects.split('?')[0];
        if (path.includes('/agents/create') || path.includes('/agents/edit')) {
          this.destroy();
        }
      });
  }

  /**
   * Llamar cuando el home haya completado la secuencia de fades (panel Bienvenido incluido).
   */
  notifyHomeWelcomeSequenceComplete(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      sessionStorage.setItem(FIRST_AGENT_TOUR_HOME_READY_KEY, '1');
    } catch {
      /* ignore */
    }
    this.tryStartAfterGates();
  }

  /** Al abrir el modal de celebración del plan (Stripe / cuenta). */
  markPlanCelebrationRequired(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      sessionStorage.setItem(PLAN_CELEBRATION_REQUIRED_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  /**
   * Solo al pulsar el botón principal del modal (ir al dashboard), no al cerrar con escape/backdrop.
   */
  notifyPlanCelebrationAccepted(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      sessionStorage.setItem(PLAN_CELEBRATION_ACCEPTED_KEY, '1');
    } catch {
      /* ignore */
    }
    this.tryStartAfterGates();
  }

  private gatesAllowStart(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      if (sessionStorage.getItem(FIRST_AGENT_TOUR_HOME_READY_KEY) !== '1') {
        return false;
      }
      if (sessionStorage.getItem(PLAN_CELEBRATION_REQUIRED_KEY) === '1') {
        return sessionStorage.getItem(PLAN_CELEBRATION_ACCEPTED_KEY) === '1';
      }
    } catch {
      return false;
    }
    return true;
  }

  private tryStartAfterGates(): void {
    if (!this.gatesAllowStart()) {
      return;
    }
    this.start();
  }

  shouldOffer(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const user = this.userStorage.user();
    if (!user?.userId) {
      return false;
    }
    if (requiresSubscriptionPaywall(user)) {
      return false;
    }
    if (this.isSkipped(user.userId)) {
      return false;
    }
    if (this.isMilestoneDone(user.userId)) {
      return false;
    }
    if (this.userHasAgents(user)) {
      return false;
    }
    try {
      if (sessionStorage.getItem(FIRST_AGENT_TOUR_SESSION_KEY) === '1') {
        return false;
      }
    } catch {
      /* ignore */
    }
    return true;
  }

  private isSkipped(userId: string): boolean {
    try {
      return localStorage.getItem(firstAgentTourSkippedKey(userId)) === '1';
    } catch {
      return false;
    }
  }

  private isMilestoneDone(userId: string): boolean {
    try {
      return localStorage.getItem(firstAgentTourMilestoneKey(userId)) === '1';
    } catch {
      return false;
    }
  }

  /**
   * Llamar cuando se crea un agente con éxito; persiste antes de que el perfil refresque agentes.
   */
  notifyFirstAgentCreated(): void {
    const uid = this.userStorage.user()?.userId;
    if (!uid) return;
    this.markFirstAgentMilestone(uid);
  }

  private markFirstAgentMilestone(userId: string): void {
    try {
      localStorage.setItem(firstAgentTourMilestoneKey(userId), '1');
    } catch {
      /* ignore */
    }
  }

  markSkipped(): void {
    const uid = this.userStorage.user()?.userId;
    if (!uid) {
      return;
    }
    try {
      localStorage.setItem(firstAgentTourSkippedKey(uid), '1');
    } catch {
      /* ignore */
    }
  }

  private markSessionTourShown(): void {
    try {
      sessionStorage.setItem(FIRST_AGENT_TOUR_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  private userHasAgents(user: User): boolean {
    const n =
      user.planUsage?.agentsCount ?? (user.agents?.length ? user.agents.length : 0);
    return n > 0;
  }

  /**
   * Según la ruta: menú lateral → lista agentes, o solo el botón crear si ya está en /agents.
   */
  start(): void {
    if (!this.gatesAllowStart()) {
      return;
    }
    if (!this.shouldOffer()) {
      return;
    }
    const path = this.router.url.split('?')[0];
    if (path.includes('/agents/create') || path.includes('/agents/edit')) {
      return;
    }
    this.markSessionTourShown();
    if (path.startsWith('/dashboard/agents') && !path.includes('/create')) {
      setTimeout(() => this.startPhaseAddAgentOnly(), 400);
    } else {
      setTimeout(() => this.startPhaseNavToAgents(), 400);
    }
  }

  destroy(): void {
    try {
      this.activeDriver?.destroy();
    } catch {
      /* ignore */
    }
    this.activeDriver = null;
  }

  private getNavAgentsElement(): Element | null {
    if (typeof document === 'undefined') {
      return null;
    }
    const xl = window.matchMedia('(min-width: 1280px)').matches;
    return xl
      ? document.getElementById('tour-nav-agents-desktop')
      : document.getElementById('tour-nav-agents-mobile');
  }

  private wireSkipButton(popover: PopoverDOM, d: Driver): void {
    if (popover.footerButtons.querySelector('.first-agent-tour-skip')) {
      return;
    }
    const t = this.i18n.getTranslations();
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'first-agent-tour-skip driver-popover-btn driver-popover-skip-btn';
    skip.textContent = t.firstAgentTourSkip;
    skip.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.markSkipped();
      d.destroy();
    });
    popover.footerButtons.insertBefore(skip, popover.footerButtons.firstChild);
  }

  /** Recalcula agujero y popover tras pintar (fuentes/layout); mejora alineación del flechazo */
  private scheduleTourLayoutRefresh(drv: Driver): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        drv.refresh();
        window.setTimeout(() => drv.refresh(), 48);
      });
    });
  }

  private startPhaseNavToAgents(): void {
    const t = this.i18n.getTranslations();
    const el = this.getNavAgentsElement();
    if (!el) {
      void this.router.navigate(['/dashboard/agents']).then(() => {
        setTimeout(() => this.startPhaseAddAgentOnly(), 600);
      });
      return;
    }

    const d = driver({
      showProgress: false,
      animate: true,
      overlayOpacity: 0.78,
      stagePadding: 4,
      stageRadius: 8,
      popoverOffset: 6,
      smoothScroll: true,
      popoverClass: 'first-agent-tour-popover',
      showButtons: ['next', 'close'],
      allowClose: true,
      doneBtnText: t.firstAgentTourNextToAgents,
      onPopoverRender: (popover, { driver: drv }) => {
        this.wireSkipButton(popover, drv);
        this.scheduleTourLayoutRefresh(drv);
      },
      onCloseClick: () => {
        this.markSkipped();
        this.destroy();
      },
      onDestroyed: () => {
        this.activeDriver = null;
      },
      steps: [
        {
          element: el,
          popover: {
            title: t.firstAgentTourStep1Title,
            description: t.firstAgentTourStep1Desc,
            side: 'right',
            align: 'center',
            onNextClick: (_element, _step, { driver: drv }) => {
              void this.router.navigate(['/dashboard/agents']).then(() => {
                drv.destroy();
                setTimeout(() => this.startPhaseAddAgentOnly(), 550);
              });
            },
          },
        },
      ],
    });
    this.activeDriver = d;
    d.drive(0);
  }

  private startPhaseAddAgentOnly(): void {
    const tryHighlight = (attempt: number) => {
      const btn = document.getElementById('tour-add-agent');
      if (!btn) {
        if (attempt < 8) {
          setTimeout(() => tryHighlight(attempt + 1), 200);
        }
        return;
      }
      const t = this.i18n.getTranslations();
      const d = driver({
        showProgress: false,
        animate: true,
        overlayOpacity: 0.78,
        stagePadding: 4,
        stageRadius: 8,
        popoverOffset: 6,
        smoothScroll: true,
        popoverClass: 'first-agent-tour-popover',
        showButtons: ['next', 'close'],
        allowClose: true,
        doneBtnText: t.firstAgentTourDone,
        onPopoverRender: (popover, { driver: drv }) => {
          this.wireSkipButton(popover, drv);
          this.scheduleTourLayoutRefresh(drv);
        },
        onCloseClick: () => {
          this.markSkipped();
          this.destroy();
        },
        onDestroyed: () => {
          this.activeDriver = null;
        },
        steps: [
          {
            element: btn,
            popover: {
              title: t.firstAgentTourStep2Title,
              description: t.firstAgentTourStep2Desc,
              side: 'bottom',
              align: 'center',
            },
          },
        ],
      });
      this.activeDriver = d;
      d.drive(0);
    };
    tryHighlight(0);
  }
}
