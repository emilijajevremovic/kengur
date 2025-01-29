import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PopupOkComponent, MatTooltipModule, MatSnackBarModule],
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

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService, private snackBar: MatSnackBar) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      nickname: ['', [Validators.required, Validators.minLength(4)]],
      city: ['', [Validators.required]],
      school: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const password_confirmation = group.get('password_confirmation')?.value;
    return password === password_confirmation ? null : { 'mismatch': true };
  }

  onSubmit() {
    this.submitted = true;
    this.message = "";

    

    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      //console.log(userData);
      this.authService.register(userData).subscribe({
        next: (response) => {
          this.snackBar.open('Uspešno ste se registrovali. Prijavite se.', 'OK', {
            duration: 5000,  
            panelClass: ['light-snackbar'] 
          });
          this.router.navigate(['/lobby']);
        },
        error: (error) => {
          if (error.status === 409) {
            this.message = 'Korisnik sa ovom email adresom već postoji.';
          }
          else if (error.status === 410) {
            this.message = 'Korisnik sa ovim korisničkim imenom već postoji.';
          }
          else {
            //console.error('Greška pri registraciji.', error);
            this.message = error.error?.message || 'Došlo je do greške.';
          }
        },
      });
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
