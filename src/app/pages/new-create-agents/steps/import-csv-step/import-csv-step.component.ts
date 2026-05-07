import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';
import { ConnectPhoneStepComponent } from '../connect-phone-step/connect-phone-step.component';

/** Primera celda por fila (coma, punto y coma o tab); ignora líneas vacías. */
function csvFirstCell(line: string): string {
  const t = line.trim();
  if (!t) return '';
  let cell: string;
  if (t.includes('\t')) {
    cell = t.split('\t')[0] ?? '';
  } else if (t.includes(';')) {
    cell = t.split(';')[0] ?? '';
  } else {
    cell = t.split(',')[0] ?? '';
  }
  return cell.trim().replace(/^["']+|["']+$/g, '');
}

function normalizeHeaderToken(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '')
    .toLowerCase();
}

const HEADER_FIRST_COL = /^(tel|telefono|phone|movil|numero|msisdn|number)$/;

function digitCount(s: string): number {
  return s.replace(/\D/g, '').length;
}

/** Extrae valores que parecen teléfonos desde texto CSV/tsv. */
export function extractPhonesFromDelimitedImport(text: string): string[] {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => l.trimEnd()).filter((l) => l.trim());
  if (lines.length === 0) return [];

  let start = 0;
  const firstCell = normalizeHeaderToken(csvFirstCell(lines[0]));
  if (
    HEADER_FIRST_COL.test(firstCell) ||
    firstCell.startsWith('phone') ||
    firstCell.startsWith('tel')
  ) {
    start = 1;
  }

  const out = new Set<string>();
  for (let i = start; i < lines.length; i++) {
    const cell = csvFirstCell(lines[i]);
    if (!cell) continue;
    const compact = cell.replace(/\s/g, '');
    const d = digitCount(compact);
    if (d >= 8 && d <= 18) {
      out.add(compact.startsWith('+') ? `+${compact.slice(1).replace(/\D/g, '')}` : compact.replace(/\D/g, ''));
    }
  }
  return [...out];
}

@Component({
  selector: 'app-import-csv-step',
  standalone: true,
  imports: [CommonModule, ConnectPhoneStepComponent],
  templateUrl: './import-csv-step.component.html',
  styleUrls: ['./import-csv-step.component.scss'],
})
export class ImportCsvStepComponent {
  private i18nService = inject(I18nService);

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

  @Input() phones: string[] = [];
  /** Embutido en otras pantallas (p. ej. editar agente): sin cabecera ni pie del wizard. */
  @Input() compactEmbed = false;
  /** Oculta el bloque Twilio (ya configurado en otro sitio). */
  @Input() omitTwilioSection = false;
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  /** Mismo estado Twilio que el paso «Conectar teléfono» (inbound). */
  @Input() showTwilioConfig = false;
  @Input() loadingTwilioAccounts = false;
  @Input() isTwilioValidated = false;
  @Input() isValidatingTwilio = false;
  @Input() twilioSid = '';
  @Input() twilioToken = '';
  @Input() twilioSidValidationStatus: 'success' | 'error' | null = null;
  @Input() twilioTokenValidationStatus: 'success' | 'error' | null = null;
  @Input() twilioErrorMessage = '';
  @Input() selectedTwilioAccount: {
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  } | null = null;
  @Input() twilioAccounts: Array<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }> = [];
  @Input() showNewTwilioAccountForm = false;
  @Input() availablePhoneNumbers: Array<{
    phoneId: number;
    countryCode: string;
    number: string;
    state?: 'Activo' | 'Inactivo';
    importedBy?: string;
    twilioAccountId?: number;
  }> = [];
  @Input() phoneNumber = '';
  @Input() selectedCountryCode = '+34';
  @Input() phoneValidationStatus: 'success' | 'error' | null = null;
  @Input() phoneErrorMessage = '';
  @Input() canContinueFromConnections = false;

  @Output() phonesChange = new EventEmitter<string[]>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  @Output() toggleTwilioConfigClicked = new EventEmitter<void>();
  @Output() twilioSidChange = new EventEmitter<string>();
  @Output() twilioTokenChange = new EventEmitter<string>();
  @Output() validateTwilioConfigClicked = new EventEmitter<void>();
  @Output() useExistingTwilioAccountClicked = new EventEmitter<{
    twilioAccountId: number;
    twilioSid: string;
    twilioToken: string;
  }>();
  @Output() showNewTwilioAccountClicked = new EventEmitter<void>();
  @Output() backToAccountSelectionClicked = new EventEmitter<void>();
  @Output() phoneNumberChange = new EventEmitter<string>();
  @Output() selectedCountryCodeChange = new EventEmitter<string>();
  @Output() phoneNumberSelected = new EventEmitter<{
    countryCode: string;
    number: string;
  }>();
  @Output() validatePhoneNumberClicked = new EventEmitter<void>();

  readonly previewLimit = 25;
  parseError = '';
  isDragging = false;

  readonly compactRootClass =
    'w-full flex flex-col min-h-0 flex-1 overflow-visible bg-transparent';

  readonly compactInnerClass =
    'w-full flex min-h-0 flex-col overflow-visible px-0 pb-0';

  readonly compactBodyClass =
    'flex flex-col gap-3 xl:gap-3 3xl:gap-4 pb-0 max-lg:pb-0 3xl:pb-0';

  readonly rootClass =
    'w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent box-border mx-auto max-w-4xl 3xl:max-w-7xl pt-8 sm:pt-12 3xl:pt-14 4xl:pt-56 items-center justify-start 4xl:items-start 4xl:justify-start';

  readonly innerClass =
    'w-full max-w-[560px] sm:max-w-[640px] md:max-w-[780px] xl:max-w-[740px] 3xl:max-w-[880px] px-5 sm:px-6 md:px-7 xl:px-6 3xl:px-8 flex min-h-0 flex-col overflow-visible pb-6 max-lg:pb-8';

  readonly bodyClass =
    'flex flex-col gap-3 sm:gap-4 xl:gap-3 3xl:gap-4 pb-12 max-lg:pb-28 3xl:pb-14';

  get t() {
    return this.i18nService.getTranslations();
  }

  get previewPhones(): string[] {
    return this.phones.slice(0, this.previewLimit);
  }

  getHiddenCount(): number {
    return Math.max(0, this.phones.length - this.previewLimit);
  }

  get previewMoreLabel(): string {
    const n = this.getHiddenCount();
    if (n <= 0) return '';
    return this.t.outboundImportCsvPreviewMore.replace(/\{n\}/g, String(n));
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  onBrowseClick(input: HTMLInputElement): void {
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.readFile(file);
  }

  private readFile(file: File): void {
    this.parseError = '';
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.parseError = this.t.outboundImportCsvParseErrorInvalidType;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      this.applyParsed(text);
    };
    reader.onerror = () => {
      this.parseError = this.t.outboundImportCsvParseErrorRead;
    };
    reader.readAsText(file, 'UTF-8');
  }

  private applyParsed(text: string): void {
    try {
      const found = extractPhonesFromDelimitedImport(text);
      if (found.length === 0) {
        this.parseError = this.t.outboundImportCsvParseErrorNoPhones;
        return;
      }
      const merged = [...new Set([...this.phones, ...found])];
      this.phonesChange.emit(merged);
    } catch {
      this.parseError = this.t.outboundImportCsvParseErrorGeneric;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.readFile(file);
  }

  removeAt(index: number): void {
    const next = this.phones.filter((_, i) => i !== index);
    this.phonesChange.emit(next);
  }

  clearAll(): void {
    this.parseError = '';
    this.phonesChange.emit([]);
  }
}
