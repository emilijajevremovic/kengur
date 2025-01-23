import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PopupOkComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  passwordFieldType1: string = 'password';
  passwordFieldType2: string = 'password';
  message1: string = '';
  message2: string = '';
  registerForm!: FormGroup;
  showPopup: boolean = false;
  popupMessage: string = 'Ovo je univerzalni popup!';

  constructor(private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'mismatch': true };
  }

  onSubmit() {
    this.message1 = '';
    this.message2 = '';

    if (this.registerForm.value.email) {
      if (this.registerForm.get('email')?.valid) {
        // Validate password
        if (this.registerForm.value.password && this.registerForm.value.password.length < 8) {
          this.message2 = '*Šifra mora imati najmanje 8 karaktera.';
        } else if (this.registerForm.value.password.length >= 8) {
          if (this.registerForm.valid) {
            // Simulacija slanja na backend (ovde dodaj backend logiku)
            console.log('Forma uspešno poslata:', this.registerForm.value);
            this.popupMessage = 'Uspešno ste resetovali šifru!';
            this.openPopup();
          } else {
            this.message2 = '*Šifre se ne poklapaju.';
          }
        } else {
          this.message2 = '*Šifra je obavezna.';
        }
      } else {
        this.message1 = '*Email nije validan.';
      }
    } else {
      this.message1 = '*Email je obavezan.';
    }
  }

  togglePasswordVisibility1() {
    this.passwordFieldType1 =
      this.passwordFieldType1 === 'password' ? 'text' : 'password';
  }

  togglePasswordVisibility2() {
    this.passwordFieldType2 =
      this.passwordFieldType2 === 'password' ? 'text' : 'password';
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
}
