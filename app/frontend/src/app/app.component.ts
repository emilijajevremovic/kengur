import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { WebsocketService } from './services/websocket.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    FormsModule, 
    ReactiveFormsModule, 
    CommonModule,
    HttpClientModule,
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'kengur';
  isPopupOpen: boolean = false;
  challengerName!: string;
  category: string = 'math';
  classSelected!: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService, private authService: AuthService, private webSocketService: WebsocketService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('auth_token')) {
      this.userService.setUserOnline().subscribe({
        // next: (data) => console.log('Korisnik postavljen kao online:', data),
        // error: (error) => console.error('Greška pri postavljanju online statusa:', error)
      });

      window.addEventListener('beforeunload', this.setUserOffline.bind(this));

      this.authService.getUserData().subscribe({
        next: (response) => {
          const userId = response.user.id;
          this.subscribeToChallenges(userId);
        },
        error: (error) => console.error('Greška pri dohvatanju korisničkih podataka:', error)
      });

    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.setUserOffline.bind(this));
    }
  }

  setUserOffline() {
    this.userService.setUserOffline().subscribe({
      // next: (data) => console.log('Korisnik postavljen kao offline:', data),
      // error: (error) => console.error('Greška pri postavljanju offline statusa:', error)
    });
  }

  subscribeToChallenges(userId: number): void {
    this.webSocketService.subscribeToChallenge(userId, (data: any) => {
      this.challengerName = data.challengerName;
      this.category = data.category;
      this.classSelected = data.class;
      this.isPopupOpen = true;
    });
  }

  closePopup() {
    this.isPopupOpen = false; 
  }

  acceptChallenge() {

  }

  rejectChallenge() {

  }

}
