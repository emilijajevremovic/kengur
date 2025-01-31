import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent {
  resetForm: FormGroup;
  token = '';
  message = '';

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private http: HttpClient, private router: Router) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  resetPassword() {
    if (this.resetForm.invalid || this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      this.message = 'Šifre se ne poklapaju!';
      return;
    }

    const data = { ...this.resetForm.value, token: this.token };

    this.http.post('http://localhost:8000/api/reset-password', data)
      .subscribe(
        (res: any) => {
          this.message = 'Lozinka uspešno promenjena!';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        (err) => this.message = 'Neispravan token ili email!'
      );
  }
}
