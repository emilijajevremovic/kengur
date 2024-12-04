import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  passwordFieldType: string = 'password';
  message: string = '';
  registerForm!: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]] 
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
    this.message = '';
    if (this.registerForm.value.email) {
      if (this.registerForm.get('email')?.valid) { 
        // Provera lozinke
        if (this.registerForm.value.password && this.registerForm.value.password.length < 8) {
          this.message = "*Šifra mora imati najmanje 8 karaktera.";
        } else if (this.registerForm.value.password.length >= 8) {
          if (this.registerForm.valid) {
            this.message = "*Registracija uspešna!";
            // slanje na backend
          } else {
            this.message = "*Šifre se ne poklapaju.";
          }
        } else {
          this.message = "*Šifra je obavezna.";
        }
      } else { 
        this.message = "*Email nije validan."; 
      }
    } else {
      // Ako email nije unet
      this.message = "*Email je obavezan.";
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  navigateToLogin() { this.router.navigate(['/login']); }
  
}
