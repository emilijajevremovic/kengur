import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [RouterModule, NavbarComponent, NgIf, CommonModule, FormsModule],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.scss'
})
export class FriendRequestsComponent {

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  searchQuery: string = '';
  isPopupOpen = false;

  searchUsers() {
    if (this.searchQuery.trim()) {
      this.authService.getUserByNickname(this.searchQuery).subscribe({
        next: (response) => {
          console.log('Pretraga korisnika:', response);
          // Obradi rezultate pretrage ovde
        },
        error: (error) => {
          console.error('Greška prilikom pretrage:', error);
          console.log('Detalji greške:', error?.error);
        }
      });
    } else {
      this.snackBar.open('Unesite korisničko ime za pretragu.', 'OK', {
        duration: 5000,  
        panelClass: ['light-snackbar'] 
      });
    }
  }

  openPopup() {
    this.isPopupOpen = true; 
  }

  closePopup() {
    this.isPopupOpen = false; 
  }
}
