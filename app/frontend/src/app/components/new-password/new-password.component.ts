import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {
  resetForm: FormGroup;
  token: any;
  email = '';
  message = '';
  success = false;
  passwordFieldType: string = 'password';
  passwordFieldType2: string = 'password';
  submitted: boolean = false;
  baseUrl = environment.apiUrl;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private http: HttpClient, private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.route.paramMap.subscribe(params => {
      this.token = params.get('token');
    });
  
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
  }

  onSubmit() {
    //console.log(this.token);
    //console.log(this.email);

    this.submitted = true;
    if (this.resetForm.invalid || this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      this.message = '*Šifre se ne poklapaju!';
      return;
    }

    const resetData = { 
      email: this.email,
      token: this.token,  
      password: this.resetForm.value.password,  
      password_confirmation: this.resetForm.value.password  
    };

    this.authService.resetPassword(resetData).subscribe(
      (res: any) => {
        this.message = '';
        this.snackBar.open('Šifra uspešno promenjena.', 'OK', {
          duration: 5000,  
          panelClass: ['light-snackbar'] 
        });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      (err) => {
        this.message = '*Došlo je do greške. Pokušajte ponovo.';
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordFieldType =
      this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  togglePasswordVisibility2() {
    this.passwordFieldType2 =
      this.passwordFieldType2 === 'password' ? 'text' : 'password';
  }

  navigateToLogin() { this.router.navigate(['/login']); }
}
