import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  miFormulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.miFormulario = this.fb.group({
      nombre: [''],
      apellidos: ['']
    });
  }

  guardarCambios() {
    console.log(this.miFormulario.value);
  }
}
