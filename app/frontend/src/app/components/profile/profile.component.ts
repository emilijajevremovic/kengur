import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { NgIf, CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PusherService } from '../../services/pusher.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NavbarComponent,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private pusherService: PusherService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.minLength(4)]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      school: ['', [Validators.required]],
      city: ['', [Validators.required]],
      class: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      math_grade: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      info_grade: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  baseUrl = environment.apiUrl;

  profileForm!: FormGroup;
  errorMessage: string = '';
  user: any = {};
  profileImage: any;
  profileImagePreview: any;
  pictureSelected: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  ngOnInit(): void {
    this.pictureSelected = false;
    this.authService.getUserData().subscribe({
      next: (data) => {
        //console.log(data);
        this.user = data.user;
        this.profileImage = this.user.profile_picture;

        this.profileForm.patchValue(this.user);
        //console.log(this.profileForm);
        //console.log('User data:', this.user);
        //console.log(this.profileImage);
      },
      error: (error) => {
        //console.error('Error fetching user data:', error);
      },
    });
  }

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    this.pictureSelected = true;
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];

      this.profileImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result as string; // This is for preview purposes
      };
      reader.readAsDataURL(file);
    }
  }

  changeUserInfo() {
    this.profileForm.patchValue(this.user);
    if (this.profileForm.valid) {
      this.errorMessage = '';
      const formData = new FormData();
      if (this.profileImage && this.profileImage.type) {
        formData.append('profile_picture', this.profileImage);
      }
      formData.append('nickname', this.user.nickname);
      formData.append('name', this.user.name);
      formData.append('surname', this.user.surname);
      formData.append('school', this.user.school);
      formData.append('city', this.user.city);
      formData.append('class', this.user.class);
      formData.append('math_grade', this.user.math_grade);
      formData.append('info_grade', this.user.info_grade);


      this.authService.updateUserProfile(formData).subscribe({
        next: (response) => {
          this.snackBar.open('Profil uspešno ažuriran.', 'OK',
            {
              duration: 5000,
              panelClass: ['light-snackbar'],
            }
          );
          //console.log('Profil uspešno ažuriran:', response);
          // Ažuriraj sliku ili nickname na frontu ako je potrebno
        },
        error: (error) => {
          if (error.error?.error === "Korisničko ime već postoji.") {
            this.errorMessage = "Korisničko ime već postoji.";
            this.snackBar.open(error.error.error, 'OK', {
                duration: 5000,
                panelClass: ['light-snackbar'],
            });
        } else {
            this.snackBar.open('Došlo je do greške prilikom ažuriranja profila.', 'OK', {
                duration: 5000,
                panelClass: ['light-snackbar'],
            });
        }
        },
      });
    } else {
      if (this.user.nickname.length < 4) {
        this.errorMessage = '*Korisničko ime mora sadržati bar 4 karaktera.';
      } else {
        this.snackBar.open(
          'Forma mora biti pravilno popunjena, pokušajte ponovo.',
          'OK',
          {
            duration: 5000,
            panelClass: ['light-snackbar'],
          }
        );
      }
    }
  }

  logout() {
    this.pusherService.disconnect();
    this.setUserOffline();
    this.authService.logout();
  }

  setUserOffline() {
    const token = localStorage.getItem('auth_token');
    this.userService.setUserOffline(token).subscribe({
      // next: (data) => console.log('Korisnik postavljen kao offline:', data),
      // error: (error) => console.error('Greška pri postavljanju offline statusa:', error)
    });
  }
}
