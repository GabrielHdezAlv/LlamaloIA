import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voices-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './voices-step.component.html',
  styleUrls: ['./voices-step.component.scss'],
})
export class VoicesStepComponent {
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

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
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

  getSelectedCountryOption() {
    return (
      this.countryOptions.find((c) => c.code === this.selectedCountry) ||
      this.countryOptions[0]
    );
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

