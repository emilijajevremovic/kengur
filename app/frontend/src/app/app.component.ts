import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    FormsModule, 
    ReactiveFormsModule, 
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'kengur';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('auth_token')) {
      this.userService.setUserOnline().subscribe({
        // next: (data) => console.log('Korisnik postavljen kao online:', data),
        // error: (error) => console.error('Greška pri postavljanju online statusa:', error)
      });

      window.addEventListener('beforeunload', this.setUserOffline.bind(this));
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
}
