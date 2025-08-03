import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PopupOkComponent, MatTooltipModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  message = '';
  success = '';
  submitted = false;
  step = 1;
  generatedCode = '';
  passwordFieldType = 'password';
  passwordFieldType2 = 'password';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.message = '';
    this.success = '';

    if (this.step === 1) {
      if (this.resetForm.get('email')?.invalid) return;

      this.generatedCode = Math.floor(10000 + Math.random() * 90000).toString();
      localStorage.setItem('reset_code', this.generatedCode);
      localStorage.setItem('reset_email', this.resetForm.value.email);

      this.authService.sendResetEmail(this.resetForm.value.email, this.generatedCode).subscribe(
        () => {
          this.step = 2;
          this.snackBar.open('Verifikacioni kod je poslat na unetu email adresu. Proverite Spam folder ukoliko poruka nije u prijemnom sandučetu.', 'OK', {
            duration: 5000,
            panelClass: ['light-snackbar']
          });
        },
        err => {
          if (err.status === 404) {
            this.message = '*Ne postoji korisnik sa unetim emailom.';
          } else {
            this.message = '*Greška prilikom slanja emaila.';
          }
        }
      );
    }

    else if (this.step === 2) {
      const enteredCode = this.resetForm.value.code;
      if (!enteredCode || enteredCode !== this.generatedCode) {
        this.message = '*Pogrešan kod!';
        return;
      }
      this.step = 3;
    }

    else if (this.step === 3) {
      const pass = this.resetForm.value.password;
      const confirm = this.resetForm.value.confirmPassword;

      if (!pass || !confirm || pass.length < 8 || pass !== confirm) {
        this.message = '*Šifre nisu ispravne ili se ne poklapaju.';
        return;
      }

      const email = localStorage.getItem('reset_email');

      this.authService.resetPassword({
        email: email,
        password: pass,
        password_confirmation: confirm
      }).subscribe(
        () => {
          localStorage.removeItem('reset_code');
          localStorage.removeItem('reset_email');
          this.success = 'Šifra je uspešno promenjena!';
          this.snackBar.open('Uspešno ste promenili šifru.', 'OK', {
            duration: 4000,
            panelClass: ['light-snackbar']
          });
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        () => {
          this.message = '*Greška prilikom promene šifre.';
        }
      );
    }
  }

  getButtonText(): string {
    if (this.step === 1) return 'Pošalji e-mail';
    if (this.step === 2) return 'Potvrdi kod';
    return 'Promeni šifru';
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  togglePasswordVisibility2() {
    this.passwordFieldType2 = this.passwordFieldType2 === 'password' ? 'text' : 'password';
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
