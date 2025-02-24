import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  constructor(private authService: AuthService) {}

  baseUrl = environment.apiUrl;
  user: any = {};
  profileImage: string = '';

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

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }
}
