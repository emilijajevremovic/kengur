import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {
  resetForm: FormGroup;
  token = '';
  message = '';
  success = false;
  passwordFieldType: string = 'password';
  passwordFieldType2: string = 'password';
  submitted: boolean = false;
  baseUrl = environment.apiUrl;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private http: HttpClient, private router: Router, private authService: AuthService) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.resetForm.invalid || this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      this.message = '*Šifre se ne poklapaju!';
      return;
    }

    this.authService.resetPassword(this.token, this.resetForm.value.password).subscribe(
      (res: any) => {
        this.message = 'Lozinka uspešno promenjena.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      (err) => {
        this.message = '*Neispravan token ili email.';
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
