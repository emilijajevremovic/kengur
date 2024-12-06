import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  passwordFieldType: string = 'password';
  loginForm!: FormGroup;
  message1: string = '';
  message2: string = '';

  constructor(private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(8)]] 
    });
  }

  onSubmit() {
    this.message1 = '';
    this.message2 = '';
    if (this.loginForm.value.email) {
      if (this.loginForm.get('email')?.valid) { 
        // provera lozinke
        if (this.loginForm.value.password && this.loginForm.value.password.length < 8) this.message2 = "*Šifra mora imati 8 karaktera."
        else if (this.loginForm.value.password.length >= 8) {
          // poziv servisa
        }
        else this.message2 = "*Šifra je obavezna."
      } 
      else { this.message1 = "*Email nije validan."; }
    } 
    else {
      // nije unet email
      this.message1 = "*Email je obavezan."
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  navigateToRegister() { this.router.navigate(['/register']); }
}
