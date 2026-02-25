import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-connect-phone-step',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './connect-phone-step.component.html',
  styleUrls: ['./connect-phone-step.component.scss'],
})
export class ConnectPhoneStepComponent {
  private i18nService = inject(I18nService);

  @Input() currentStepNumber = 0;
  @Input() totalSteps = 0;
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

  @Output() backClicked = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();
  @Output() toggleTwilioConfigClicked = new EventEmitter<void>();
  @Output() twilioSidChange = new EventEmitter<string>();
  @Output() twilioTokenChange = new EventEmitter<string>();
  @Output() validateTwilioConfigClicked = new EventEmitter<void>();
  @Output() useExistingTwilioAccountClicked = new EventEmitter<any>();
  @Output() showNewTwilioAccountClicked = new EventEmitter<void>();
  @Output() backToAccountSelectionClicked = new EventEmitter<void>();
  @Output() phoneNumberChange = new EventEmitter<string>();
  @Output() selectedCountryCodeChange = new EventEmitter<string>();
  @Output() phoneNumberSelected = new EventEmitter<{
    countryCode: string;
    number: string;
  }>();
  @Output() validatePhoneNumberClicked = new EventEmitter<void>();

  get t() {
    return this.i18nService.getTranslations();
  }

  getCurrentStepNumber(): number {
    return this.currentStepNumber;
  }

  getTotalSteps(): number {
    return this.totalSteps;
  }

  onTwilioSidInput(value: string) {
    this.twilioSid = value;
    this.twilioSidChange.emit(value);
  }

  onTwilioTokenInput(value: string) {
    this.twilioToken = value;
    this.twilioTokenChange.emit(value);
  }

  onPhoneNumberInput(value: string) {
    this.phoneNumber = value;
    this.phoneNumberChange.emit(value);
  }

  onCountryCodeChange(value: string) {
    this.selectedCountryCode = value;
    this.selectedCountryCodeChange.emit(value);
  }

  onSelectPhoneNumber(phone: { countryCode: string; number: string }) {
    this.phoneNumberSelected.emit(phone);
  }
}

