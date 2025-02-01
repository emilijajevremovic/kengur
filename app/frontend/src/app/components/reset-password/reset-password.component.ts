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

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendResetEmail(): void {
    if (this.resetForm.invalid) return;

    this.authService.sendResetEmail(this.resetForm.value.email).subscribe(
      (res: any) => {
        this.message = "";
        this.snackBar.open('E-mail je uspešno poslat. Proverite Vaše sanduče.', 'OK', {
          duration: 5000,  
          panelClass: ['light-snackbar'] 
        });
      },
      (err) => {
        if (err.status === 404) {
          this.message = '*Ne postoji korisnik sa unetim emailom.';
        } else {
          this.message = '*Došlo je do greške. Pokušajte ponovo kasnije.';
        }
      }
    );
  }

  navigateToRegister() { this.router.navigate(['/register']); }
  
}
