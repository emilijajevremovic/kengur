import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';
import { HttpClient } from '@angular/common/http';

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

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendResetEmail() {
    if (this.resetForm.invalid) return;

    this.http.post('http://localhost:8000/api/forgot-password', this.resetForm.value)
      .subscribe(
        (res: any) => this.message = 'Email za resetovanje je poslat!',
        (err) => this.message = 'Došlo je do greške!'
      );
  }

  navigateToRegister() { this.router.navigate(['/register']); }
  
}
