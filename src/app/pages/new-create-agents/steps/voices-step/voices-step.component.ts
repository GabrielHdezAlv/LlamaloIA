import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  I18nService,
  Translations,
} from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-voices-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './voices-step.component.html',
  styleUrls: ['./voices-step.component.scss'],
})
export class VoicesStepComponent {
  private i18nService = inject(I18nService);

  @Input() selectedCountry = 'es';
  @Input() countryOptions: { code: string; label: string }[] = [];
  @Input() voices: any[] = [];
  @Input() selectedVoiceId = '';
  @Input() currentPlayingVoice: string | null = null;
  @Input() voiceParameters = {
    stability: 0.72,
    similarity: 0.8,
    style: 0.5,
    boost: true,
    speed: 0.98,
  };
  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() countrySelected = new EventEmitter<string>();
  @Output() voiceSelected = new EventEmitter<string>();
  @Output() playVoiceClicked = new EventEmitter<any>();
  @Output() playVoicePreviewClicked = new EventEmitter<{ voice: any; event: Event }>();
  @Output() voiceParametersChange = new EventEmitter<any>();

  showCountryDropdown = false;
  showVoiceDropdown = false;
  showVoiceParamsDropdown = false;
  voiceParamsSidebarClosing = false;

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  get t() {
    return this.i18nService.getTranslations();
  }

  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.showVoiceDropdown = false;
    this.showVoiceParamsDropdown = false;
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  toggleVoiceDropdown(event: Event) {
    event.stopPropagation();
    this.showCountryDropdown = false;
    this.showVoiceParamsDropdown = false;
    this.showVoiceDropdown = !this.showVoiceDropdown;
  }

  toggleVoiceParamsDropdown(event: Event) {
    event.stopPropagation();
    this.showVoiceDropdown = false;
    this.showVoiceParamsDropdown = !this.showVoiceParamsDropdown;
  }

  closeVoiceParamsSidebar() {
    if (this.voiceParamsSidebarClosing) return;
    this.voiceParamsSidebarClosing = true;
    setTimeout(() => {
      this.showVoiceParamsDropdown = false;
      this.voiceParamsSidebarClosing = false;
    }, 280);
  }

  getSelectedCountryOption() {
    return (
      this.countryOptions.find((c) => c.code === this.selectedCountry) ||
      this.countryOptions[0]
    );
  }

  /** Etiqueta del idioma según el locale de la UI (ES/EN). */
  getCountryLabel(code: string): string {
    const t = this.i18nService.getTranslations();
    const key = `voiceLang_${code}` as keyof Translations;
    const translated = t[key];
    if (typeof translated === 'string' && translated.length > 0) {
      return translated;
    }
    return this.countryOptions.find((c) => c.code === code)?.label ?? code;
  }

  getSelectedVoice() {
    if (!this.selectedVoiceId) return null;
    return this.voices.find((v) => v.voiceId === this.selectedVoiceId);
  }

  selectCountry(code: string) {
    this.showCountryDropdown = false;
    this.countrySelected.emit(code);
  }

  selectVoice(voiceId: string) {
    this.showVoiceDropdown = false;
    this.voiceSelected.emit(voiceId);
    
    // Set default parameters based on the selected voice
    const voice = this.voices.find(v => v.voiceId === voiceId);
    if (voice) {
      if (voice.name.includes('Carlos')) {
        this.voiceParameters = { stability: 0.85, similarity: 0.85, style: 0.85, speed: 1.05, boost: true };
      } else if (voice.name.includes('María')) {
        this.voiceParameters = { stability: 0.45, similarity: 0.85, style: 0.40, speed: 1.05, boost: true };
      } else if (voice.name.includes('Carla')) {
        this.voiceParameters = { stability: 1.0, similarity: 0.70, style: 0.40, speed: 1.15, boost: false };
      } else if (voice.name.includes('David')) {
        this.voiceParameters = { stability: 0.70, similarity: 0.70, style: 0.70, speed: 1.15, boost: true };
      } else if (voice.name.includes('Jesús') || voice.name.includes('Jesus')) {
        this.voiceParameters = { stability: 1.0, similarity: 0.70, style: 0.30, speed: 1.15, boost: false };
      } else if (voice.name.includes('Claudia')) {
        this.voiceParameters = { stability: 1.0, similarity: 0.80, style: 0.20, speed: 1.15, boost: true };
      } else {
        // Fallback default
        this.voiceParameters = { stability: 0.5, similarity: 0.8, style: 0.5, speed: 0.98, boost: true };
      }
      this.onVoiceParametersChange();
    }
  }

  playVoice(voice: any) {
    this.playVoiceClicked.emit(voice);
  }

  playVoicePreview(voice: any, event: Event) {
    event.stopPropagation();
    this.playVoicePreviewClicked.emit({ voice, event });
  }

  onVoiceParametersChange() {
    this.voiceParametersChange.emit({ ...this.voiceParameters });
  }
}

