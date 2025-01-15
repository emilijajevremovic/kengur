import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [RouterModule, NavbarComponent, NgIf, CommonModule],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.scss'
})
export class FriendRequestsComponent {
  isPopupOpen = false;

  openPopup() {
    this.isPopupOpen = true; 
  }

  closePopup() {
    this.isPopupOpen = false; 
  }
}
