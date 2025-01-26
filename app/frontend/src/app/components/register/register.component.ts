import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PopupOkComponent, MatTooltipModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  passwordFieldType1: string = 'password';
  passwordFieldType2: string = 'password';
  message: string = '';
  registerForm!: FormGroup;
  submitted = false;
  showPopup: boolean = false;
  popupMessage: string = 'Ovo je univerzalni popup!';

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  constructor(private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      nickname: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      school: ['', [Validators.required]],
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
    this.submitted = true;
    this.message = "";

    if (this.registerForm.valid) {
      //console.log('Forma je validna:', this.registerForm.value);
      // Ovde pošaljite podatke na backend
    } else {
      if (this.registerForm.errors?.['mismatch']) {
        this.message = 'Šifre se ne poklapaju.';
      }
      else 
        this.message = 'Forma nije validna.';
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

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
