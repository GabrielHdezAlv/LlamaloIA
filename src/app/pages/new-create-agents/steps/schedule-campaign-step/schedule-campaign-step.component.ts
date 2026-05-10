import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  HostBinding,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Overlay, OverlayModule, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { I18nService } from '../../../../core/services/i18n.service';
import {
  SegmentationSelectComponent,
  SegmentationSelectOption,
} from '../segmentation-step/segmentation-select.component';

export const OUTBOUND_SCHEDULE_SCHEMA_VERSION = 2;

export interface OutboundScheduleCampaignFormState {
  v: number;
  useBusinessHours: boolean;
  useCustomSchedule: boolean;
  /** Lun–Dom (índice 0 = lunes). */
  customWeekdays: boolean[];
  customTimeFrom: string;
  customTimeTo: string;
  initialDelay: string;
  retriesCount: string;
  retriesInterval: string;
  maxCallsPerDay: string;
}

export function defaultOutboundScheduleForm(): OutboundScheduleCampaignFormState {
  return {
    v: OUTBOUND_SCHEDULE_SCHEMA_VERSION,
    useBusinessHours: true,
    useCustomSchedule: false,
    customWeekdays: [true, true, true, true, true, false, false],
    customTimeFrom: '09:00',
    customTimeTo: '18:00',
    initialDelay: '1h_abandon',
    retriesCount: '3',
    retriesInterval: '4h',
    maxCallsPerDay: '2',
  };
}

function normalizeWeekdays(w: unknown): boolean[] {
  const d = defaultOutboundScheduleForm().customWeekdays;
  if (!Array.isArray(w) || w.length !== 7) {
    return [...d];
  }
  return w.map((x) => !!x);
}

function mergeSchedule(
  parsed: Partial<OutboundScheduleCampaignFormState>,
): OutboundScheduleCampaignFormState {
  const d = defaultOutboundScheduleForm();
  return {
    ...d,
    ...parsed,
    customWeekdays: normalizeWeekdays(parsed.customWeekdays),
    customTimeFrom:
      typeof parsed.customTimeFrom === 'string' ? parsed.customTimeFrom : d.customTimeFrom,
    customTimeTo:
      typeof parsed.customTimeTo === 'string' ? parsed.customTimeTo : d.customTimeTo,
    v: OUTBOUND_SCHEDULE_SCHEMA_VERSION,
  };
}

export function parseOutboundScheduleNotes(
  raw: string | null | undefined,
): OutboundScheduleCampaignFormState {
  const trimmed = (raw ?? '').trim();
  if (!trimmed.startsWith('{')) {
    return defaultOutboundScheduleForm();
  }
  try {
    const parsed = JSON.parse(trimmed) as Partial<OutboundScheduleCampaignFormState>;
    if (!parsed || typeof parsed !== 'object') {
      return defaultOutboundScheduleForm();
    }
    return mergeSchedule(parsed);
  } catch {
    return defaultOutboundScheduleForm();
  }
}

export function serializeOutboundScheduleForm(
  form: OutboundScheduleCampaignFormState,
): string {
  return JSON.stringify({ ...form, v: OUTBOUND_SCHEDULE_SCHEMA_VERSION });
}

@Component({
  selector: 'app-schedule-campaign-step',
  standalone: true,
  imports: [CommonModule, SegmentationSelectComponent, OverlayModule],
  templateUrl: './schedule-campaign-step.component.html',
  styleUrls: ['./schedule-campaign-step.component.scss'],
})
export class ScheduleCampaignStepComponent implements OnChanges, OnDestroy {
  private i18nService = inject(I18nService);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('customScheduleModalTpl')
  customScheduleModalTpl!: TemplateRef<unknown>;

  private overlayRef: OverlayRef | null = null;
  private overlaySubs = new Subscription();

  @HostBinding('class.flex')
  readonly hostFlex = true;
  @HostBinding('class.flex-col')
  readonly hostFlexCol = true;
  @HostBinding('class.min-h-0')
  readonly hostMinH0 = true;
  @HostBinding('class.flex-1')
  readonly hostFlex1 = true;
  @HostBinding('class.overflow-hidden')
  get hostOverflowHidden(): boolean {
    return !this.compactEmbed;
  }

  @HostBinding('class.sch-compact-embed')
  get schCompactEmbed(): boolean {
    return this.compactEmbed;
  }

  @Input() scheduleNotes = '';
  /** Lista CSV / Make: sin selector de retraso inicial (se usa el mínimo). */
  @Input() hideScheduleInitialDelay = false;
  @Input() compactEmbed = false;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() scheduleNotesChange = new EventEmitter<string>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  form: OutboundScheduleCampaignFormState = defaultOutboundScheduleForm();

  /** Copia editable en el modal; null si el modal está cerrado. */
  modalForm: OutboundScheduleCampaignFormState | null = null;
  /** Estado del formulario antes de abrir el modal (cancel restaura esto). */
  private modalCancelBaseline: OutboundScheduleCampaignFormState | null = null;

  readonly retryCounts = ['1', '2', '3', '4', '5'];
  readonly retryIntervals = ['1h', '2h', '4h', '24h'];
  readonly maxCallsOptions = ['1', '2', '3', '5'];
  readonly weekdayIndexes = [0, 1, 2, 3, 4, 5, 6];

  readonly retryCountSelectOptions: SegmentationSelectOption[] = this.retryCounts.map((n) => ({
    value: n,
    label: n,
  }));
  readonly retryIntervalSelectOptions: SegmentationSelectOption[] = this.retryIntervals.map((iv) => ({
    value: iv,
    label: iv,
  }));
  readonly maxCallsSelectOptions: SegmentationSelectOption[] = this.maxCallsOptions.map((n) => ({
    value: n,
    label: n,
  }));

  readonly modalTimeHourOptions: SegmentationSelectOption[] = Array.from({ length: 24 }, (_, i) => {
    const v = String(i).padStart(2, '0');
    return { value: v, label: v };
  });
  readonly modalTimeMinuteOptions: SegmentationSelectOption[] = Array.from({ length: 60 }, (_, i) => {
    const v = String(i).padStart(2, '0');
    return { value: v, label: v };
  });

  private lastEmitted = '';

  get t() {
    return this.i18nService.getTranslations();
  }

  readonly compactRootClass =
    'w-full flex flex-col min-h-0 flex-1 overflow-visible bg-transparent';

  readonly compactInnerClass =
    'w-full flex min-h-0 flex-col overflow-visible px-0 pb-0';

  readonly compactBodyClass =
    'flex flex-col gap-5 xl:gap-5 3xl:gap-6 pb-0 max-lg:pb-0 3xl:pb-0';

  readonly rootClass =
    'w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent box-border mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56 items-center justify-start';

  readonly innerClass =
    'w-full max-w-[560px] sm:max-w-[640px] md:max-w-[780px] xl:max-w-[740px] 3xl:max-w-[880px] px-5 sm:px-6 md:px-7 xl:px-6 3xl:px-8 flex min-h-0 flex-col overflow-visible pb-6 max-lg:pb-8';

  readonly bodyClass =
    'flex flex-col gap-4 xl:gap-3 3xl:gap-5 pb-12 max-lg:pb-28 3xl:pb-14';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scheduleNotes']) {
      const raw = this.scheduleNotes ?? '';
      if (raw !== this.lastEmitted) {
        this.form = parseOutboundScheduleNotes(raw);
      }
    }
    if (this.hideScheduleInitialDelay) {
      const minDelay = '30m_abandon';
      if (this.form.initialDelay !== minDelay) {
        this.form = { ...this.form, initialDelay: minDelay };
        this.persist();
      }
    }
  }

  ngOnDestroy(): void {
    this.detachScheduleOverlay();
  }

  persist(): void {
    const s = serializeOutboundScheduleForm(this.form);
    this.lastEmitted = s;
    this.scheduleNotesChange.emit(s);
  }

  get initialDelaySelectOptions(): SegmentationSelectOption[] {
    const tr = this.t;
    return [
      { value: '30m_abandon', label: tr.outboundScheduleDelay30mAbandon },
      { value: '1h_abandon', label: tr.outboundScheduleDelay1hAbandon },
      { value: '2h_abandon', label: tr.outboundScheduleDelay2hAbandon },
      { value: '24h_abandon', label: tr.outboundScheduleDelay24hAbandon },
    ];
  }

  onScheduleField(field: keyof OutboundScheduleCampaignFormState, value: string): void {
    this.form = { ...this.form, [field]: value as never };
    this.persist();
  }

  setBusinessHours(on: boolean): void {
    if (on) {
      this.detachScheduleOverlay();
      this.modalForm = null;
      this.modalCancelBaseline = null;
    }
    this.form = {
      ...this.form,
      useBusinessHours: on,
      useCustomSchedule: on ? false : this.form.useCustomSchedule,
    };
    if (!this.form.useBusinessHours && !this.form.useCustomSchedule) {
      this.form = { ...this.form, useBusinessHours: true };
    }
    this.persist();
  }

  setCustomSchedule(on: boolean): void {
    if (on) {
      this.modalCancelBaseline = this.cloneForm(this.form);
      const def = defaultOutboundScheduleForm();
      this.form = {
        ...this.form,
        useCustomSchedule: true,
        useBusinessHours: false,
        customWeekdays: normalizeWeekdays(this.form.customWeekdays),
        customTimeFrom: this.form.customTimeFrom ?? def.customTimeFrom,
        customTimeTo: this.form.customTimeTo ?? def.customTimeTo,
      };
      this.modalForm = this.cloneForm(this.form);
      this.attachScheduleOverlay();
    } else {
      this.closeCustomModalWithoutSave();
      this.form = {
        ...this.form,
        useCustomSchedule: false,
        useBusinessHours: true,
      };
      this.persist();
    }
  }

  openCustomScheduleEditor(): void {
    if (!this.form.useCustomSchedule) {
      return;
    }
    this.modalCancelBaseline = this.cloneForm(this.form);
    this.modalForm = this.cloneForm(this.form);
    this.attachScheduleOverlay();
  }

  toggleWeekday(index: number): void {
    if (!this.modalForm) {
      return;
    }
    const next = [...this.modalForm.customWeekdays];
    next[index] = !next[index];
    this.modalForm.customWeekdays = next;
  }

  modalTimeHour(raw: string): string {
    return this.splitModalTimeString(raw)[0];
  }

  modalTimeMinute(raw: string): string {
    return this.splitModalTimeString(raw)[1];
  }

  setModalTimeHour(which: 'from' | 'to', hour: string): void {
    if (!this.modalForm) {
      return;
    }
    const key = which === 'from' ? 'customTimeFrom' : 'customTimeTo';
    const [, m] = this.splitModalTimeString(this.modalForm[key]);
    const h = (hour ?? '00').padStart(2, '0').slice(-2);
    this.modalForm = { ...this.modalForm, [key]: `${h}:${m}` };
  }

  setModalTimeMinute(which: 'from' | 'to', minute: string): void {
    if (!this.modalForm) {
      return;
    }
    const key = which === 'from' ? 'customTimeFrom' : 'customTimeTo';
    const [h] = this.splitModalTimeString(this.modalForm[key]);
    const m = (minute ?? '00').padStart(2, '0').slice(-2);
    this.modalForm = { ...this.modalForm, [key]: `${h}:${m}` };
  }

  private splitModalTimeString(s: string): [string, string] {
    const m = /^(\d{1,2}):(\d{2})$/.exec((s ?? '').trim());
    if (!m) {
      return ['09', '00'];
    }
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10) || 0));
    const min = Math.min(59, Math.max(0, parseInt(m[2], 10) || 0));
    return [String(h).padStart(2, '0'), String(min).padStart(2, '0')];
  }

  confirmCustomModal(): void {
    if (this.modalForm) {
      this.form = {
        ...this.form,
        customWeekdays: [...this.modalForm.customWeekdays],
        customTimeFrom: this.modalForm.customTimeFrom,
        customTimeTo: this.modalForm.customTimeTo,
        useCustomSchedule: true,
        useBusinessHours: false,
      };
    }
    this.detachScheduleOverlay();
    this.modalForm = null;
    this.modalCancelBaseline = null;
    this.persist();
  }

  cancelCustomModal(): void {
    this.detachScheduleOverlay();
    if (this.modalCancelBaseline) {
      this.form = this.cloneForm(this.modalCancelBaseline);
    }
    this.modalForm = null;
    this.modalCancelBaseline = null;
    this.persist();
  }

  private closeCustomModalWithoutSave(): void {
    this.detachScheduleOverlay();
    this.modalForm = null;
    this.modalCancelBaseline = null;
  }

  private detachScheduleOverlay(): void {
    this.overlaySubs.unsubscribe();
    this.overlaySubs = new Subscription();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private attachScheduleOverlay(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.modalForm ||
      !this.customScheduleModalTpl
    ) {
      return;
    }
    this.detachScheduleOverlay();
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'sch-schedule-modal-backdrop',
      panelClass: 'sch-schedule-modal-pane',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
    });
    const portal = new TemplatePortal(this.customScheduleModalTpl, this.viewContainerRef);
    this.overlayRef.attach(portal);
    this.overlaySubs.add(
      this.overlayRef.backdropClick().subscribe(() => this.cancelCustomModal()),
    );
    this.overlaySubs.add(
      this.overlayRef.keydownEvents().subscribe((ev: Event) => {
        if ((ev as KeyboardEvent).key === 'Escape') {
          this.cancelCustomModal();
        }
      }),
    );
  }

  weekdayLetter(index: number): string {
    const tr = this.t;
    switch (index) {
      case 0:
        return tr.outboundScheduleWkMon;
      case 1:
        return tr.outboundScheduleWkTue;
      case 2:
        return tr.outboundScheduleWkWed;
      case 3:
        return tr.outboundScheduleWkThu;
      case 4:
        return tr.outboundScheduleWkFri;
      case 5:
        return tr.outboundScheduleWkSat;
      case 6:
        return tr.outboundScheduleWkSun;
      default:
        return '';
    }
  }

  private cloneForm(f: OutboundScheduleCampaignFormState): OutboundScheduleCampaignFormState {
    return JSON.parse(JSON.stringify(f)) as OutboundScheduleCampaignFormState;
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }
}
