import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatTooltipModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  passwordFieldType: string = 'password';
  loginForm!: FormGroup;
  message: string = '';
  submitted: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    this.submitted = true;
    this.message = '';

    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      //console.log(loginData);
      this.authService.login(loginData).subscribe({
        next: (response) => {
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('role', response.role);

            // this.userService.setUserOnline().subscribe({
            //   next: (data) => console.log('Korisnik postavljen kao online nakon prijave:', data),
            //   error: (error) => console.error('Greška pri postavljanju online statusa:', error)
            // });
          }
          if(this.isAdmin()) {
            this.router.navigate(['/admin-lobby']);
          }
          else {
            this.router.navigate(['/lobby']);
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.message = 'Pogrešan email ili lozinka.';
          } else {
            this.message =
              error.error?.message || 'Došlo je do greške pri prijavi.';
          }
        },
      });
    } else {
      this.message = 'Forma nije validna.';
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }
}
