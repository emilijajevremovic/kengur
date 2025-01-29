import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  constructor(private authService: AuthService) {}

  baseUrl = environment.apiUrl;

  user: any = {};
  profileImage: string = "";
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  ngOnInit(): void {
    this.authService.getUserData().subscribe({
      next: (data) => {
        this.user = data.user;
        this.profileImage = this.user.profile_picture;
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
      this.fileInput.nativeElement.click(); // Pozivanje klik na file input
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }

  changeUserInfo() {
    const formData = new FormData();
    formData.append('profile_picture', this.profileImage);
    formData.append('nickname', this.user.nickname);

    this.authService.updateUserProfile(formData).subscribe({
      next: (response) => {
        //console.log('Profil uspešno ažuriran:', response);
        // Ažuriraj sliku ili nickname na frontu ako je potrebno
      },
      error: (error) => {
        //console.error('Greška prilikom ažuriranja profila:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }

}
