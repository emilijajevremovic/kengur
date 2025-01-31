import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PopupOkComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendResetEmail(): void {
    if (this.resetForm.invalid) return;

    this.authService.sendResetEmail(this.resetForm.value.email).subscribe(
      (res: any) => {
        this.message = 'Email za resetovanje je poslat!';
      },
      (err) => {
        this.message = 'Došlo je do greške. Proverite da li je email adresa ispravna.';
      }
    );
  }

  navigateToRegister() { this.router.navigate(['/register']); }
  
}
