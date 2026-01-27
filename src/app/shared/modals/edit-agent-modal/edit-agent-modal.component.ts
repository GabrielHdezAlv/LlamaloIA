import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgentsService } from '../../../core/services/agents.service';
import { UserService } from '../../../core/services/user.service';
import { ModalService } from '../modal.service';
import { Agent, SetAgentConfigDto, VoiceParameters } from '../../../shared/models/agent.model';
import { Voice } from '../../../shared/models/voice.model';

export interface EditAgentModalData {
  agent: Agent;
}

@Component({
  selector: 'app-edit-agent-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './edit-agent-modal.component.html',
  styleUrls: ['./edit-agent-modal.component.scss'],
})
export class EditAgentModalComponent implements OnInit {
  dialogRef = inject(MatDialogRef<EditAgentModalComponent>);
  data = inject<EditAgentModalData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private agentsService = inject(AgentsService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  editForm: FormGroup;
  isLoading = false;
  voices: Voice[] = [];
  languages: any[] = [];
  
  // Propiedades para el selector de país
  showCountryMenu = false;
  selectedCountryCode = '+34';
  selectedCountry = 'es';

  constructor() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      language: ['', Validators.required],
      type: ['', Validators.required],
      voiceId: ['', Validators.required],
      firstInteraction: ['', Validators.required],
      agentInstruction: ['', Validators.required],
      countryCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      label: [''],
      state: ['', Validators.required],
      stability: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]],
      similarity: [0.75, [Validators.required, Validators.min(0), Validators.max(1)]],
      style: [0.0, [Validators.required, Validators.min(0), Validators.max(1)]],
      boost: [false],
      speed: [1.0, [Validators.required, Validators.min(0.25), Validators.max(4)]]
    });
  }

  ngOnInit(): void {
    // Cargar voces
    this.agentsService.getVoices().subscribe({
      next: (voices) => {
        this.voices = voices;
      },
      error: (error) => {
        console.error('Error al cargar voces:', error);
      }
    });

    // Cargar idiomas
    this.userService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
      },
      error: (error) => {
        console.error('Error al cargar idiomas:', error);
        // Idiomas por defecto si falla
        this.languages = [
          { code: 'es', name: 'Español' },
          { code: 'en', name: 'English' },
          { code: 'fr', name: 'Français' }
        ];
      }
    });

    // Prellenar formulario con datos del agente
    if (this.data.agent) {
      const agent = this.data.agent;
      this.selectedCountryCode = agent.phoneNumbers?.countryCode || '+34';
      this.selectedCountry = this.getCountryFromCode(agent.phoneNumbers?.countryCode || '+34');
      
      this.editForm.patchValue({
        name: agent.name || '',
        language: agent.language || 'es',
        type: agent.type || 'inbound',
        voiceId: agent.voiceId || '',
        firstInteraction: agent.firstInteraction || '',
        agentInstruction: agent.agentInstruction || '',
        countryCode: agent.phoneNumbers?.countryCode || '+34',
        phoneNumber: agent.phoneNumbers?.number || '',
        label: agent.label || '',
        state: agent.state || 'Activo',
        stability: agent.parameters?.stability ?? 0.5,
        similarity: agent.parameters?.similarity ?? 0.75,
        style: agent.parameters?.style ?? 0.0,
        boost: agent.parameters?.boost ?? false,
        speed: agent.parameters?.speed ?? 1.0
      });
    }
  }

  getCountryFromCode(code: string): string {
    const codeMap: Record<string, string> = {
      '+34': 'es',
      '+1': 'us',
      '+33': 'fr',
      '+49': 'de'
    };
    return codeMap[code] || 'es';
  }

  close(): void {
    this.dialogRef.close();
  }

  toggleCountryMenu() {
    this.showCountryMenu = !this.showCountryMenu;
  }

  selectCountry(countryCode: string, code: string) {
    this.selectedCountryCode = code;
    this.selectedCountry = countryCode;
    this.showCountryMenu = false;
    this.editForm.patchValue({ countryCode: code });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target) return;

    const dropdown = target.closest('[class*="w-28"]') || target.closest('[class*="w-32"]');
    const menu = target.closest('ul');
    const menuItem = target.closest('li');

    if (!dropdown && !menu && !menuItem) {
      this.showCountryMenu = false;
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      
      // Validar que el agente tenga agentId o usar phoneId como fallback
      const agentId = this.data.agent.agentId || this.data.agent.phoneNumbers?.phoneId;
      
      if (!agentId) {
        this.modalService.openError({
          title: 'Error',
          message: 'No se pudo identificar el agente. Por favor, recarga la página e intenta nuevamente.'
        });
        return;
      }

      // Preparar los datos según SetAgentConfigDto
      const updateData: SetAgentConfigDto = {
        name: formValue.name.trim(),
        language: formValue.language,
        type: formValue.type,
        voiceId: formValue.voiceId,
        firstInteraction: formValue.firstInteraction.trim(),
        agentInstruction: formValue.agentInstruction.trim(),
        phoneNumbers: {
          countryCode: this.selectedCountryCode,
          number: parseInt(formValue.phoneNumber.replace(/\D/g, ''), 10)
        },
        label: formValue.label.trim(),
        state: formValue.state,
        parameters: {
          stability: formValue.stability,
          similarity: formValue.similarity,
          style: formValue.style,
          boost: formValue.boost,
          speed: formValue.speed
        }
      };

      this.isLoading = true;

      this.agentsService.updateAgent(agentId, updateData).subscribe({
        next: (response) => {
          console.log('✅ Agente actualizado:', response);
          this.isLoading = false;
          this.modalService.openSuccess({
            title: 'Agente actualizado',
            message: response.message || 'El agente ha sido actualizado correctamente.'
          });
          this.dialogRef.close(true); // Cerrar con éxito para que el componente padre recargue
        },
        error: (error) => {
          console.error('❌ Error al actualizar agente:', error);
          this.isLoading = false;
          
          let errorMessage = 'Error al actualizar el agente. Por favor, intenta nuevamente.';
          
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.status === 401) {
            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          } else if (error?.status === 404) {
            errorMessage = 'Agente no encontrado.';
          } else if (error?.status === 400) {
            errorMessage = 'Error en los datos enviados. Por favor, verifica todos los campos.';
          }
          
          this.modalService.openError({
            title: 'Error al actualizar agente',
            message: errorMessage
          });
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('max')) {
      return `El valor máximo es ${field.errors?.['max'].max}`;
    }
    return '';
  }
}
