import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [RouterModule, NavbarComponent, NgIf, CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.scss'
})
export class FriendRequestsComponent implements OnInit{

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  baseUrl = environment.apiUrl;
  searchQuery: string = '';
  isPopupOpen = false;
  searchedUsers: any[] = [];
  searchPerformed = false;

  ngOnInit(): void {}

  searchUsers() {
    this.searchPerformed = false;
    if (this.searchQuery.trim()) {
      this.authService.getUserByNickname(this.searchQuery).subscribe({
        next: (response) => {
          this.searchedUsers = response;
          this.searchPerformed = true;
        },
        error: (error) => {
          console.error('Greška prilikom pretrage:', error);
          console.log('Detalji greške:', error?.error);
          this.searchPerformed = true;
        }
      });
    } else {
      this.searchPerformed = false;
      this.searchedUsers = [];
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
