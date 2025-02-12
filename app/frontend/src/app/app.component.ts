import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { WebsocketService } from './services/websocket.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from './services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';
import { PusherService } from './services/pusher.service';
import { PopupOkComponent } from './components/popup-ok/popup-ok.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    FormsModule, 
    ReactiveFormsModule, 
    CommonModule,
    HttpClientModule,
    MatTooltipModule,
    PopupOkComponent
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
  myNickname!: string;
  challengerId!: any;
  challengerPicture!: any;
  baseUrl = environment.apiUrl;
  isPopupOkOpen: boolean = false;
  popupOkMessage: string = '';
  userId: any;
  gameId: string | null = null;


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService, private authService: AuthService, private webSocketService: WebsocketService, private taskService: TaskService, private snackBar: MatSnackBar, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('auth_token')) {
      this.userService.setUserOnline().subscribe();

      window.addEventListener('beforeunload', this.handleTabClose.bind(this));

      this.authService.getUserData().subscribe({
        next: async (response) => {
          this.userId = response.user.id;
          this.myNickname = response.user.nickname;
          this.subscribeToChallenges(this.userId);
          
          await this.webSocketService.initPusherService();

          this.subscribeToRejections(this.userId);
          this.subscribeToGameStart(this.userId);

          this.gameId = localStorage.getItem('game_id');
          // window.addEventListener('beforeunload', this.handleTabClose.bind(this));
          // document.addEventListener('visibilitychange', this.handleTabClose.bind(this));
        },
        error: (error) => console.error('Greška pri dohvatanju korisničkih podataka:', error)
      });

    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.handleTabClose.bind(this));
      localStorage.removeItem('gameId');
    }
  }

  handleTabClose = () => {
    localStorage.removeItem('gameId');

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    fetch(`${this.userService.baseUrl}/set-offline`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token }),
        keepalive: true 
    })
  };

  subscribeToChallenges(userId: number): void {
    this.webSocketService.subscribeToChallenge(userId, (data: any) => {
      this.challengerName = data.challengerName;
      this.category = data.category;
      this.classSelected = data.class;
      this.challengerId = data.challengerId;
      this.challengerPicture = data.profilePicture;
      this.isPopupOpen = true;
    });
  }

  closePopup() {
    this.isPopupOpen = false; 
  }

  acceptChallenge() {
    if (!this.challengerId) return;

    const challengeData = {
      challenger_id: this.challengerId,
      opponent_id: this.userId, 
      category: this.category,
      class: this.classSelected
    };

    this.taskService.acceptChallenge(challengeData).subscribe({
      next: (response) => {
        this.isPopupOpen = false; 
      },
      error: (err) => console.error('Greška pri prihvatanju izazova:', err)
    });
  }

  rejectChallenge(): void {
    if (!this.challengerName) return;
  
    const rejectionData = {
      challenger_id: this.challengerId, 
      opponent_nickname: this.myNickname 
    };
  
    this.taskService.rejectChallenge(rejectionData).subscribe({
      next: () => {
        this.snackBar.open('Izazov odbijen.', 'OK', {
          duration: 5000,  
          panelClass: ['light-snackbar'] 
        });
        this.isPopupOpen = false; 
      },
      error: (err) => console.error('Greška pri odbijanju izazova:', err)
    });
  }

  subscribeToRejections(userId: number): void {
    this.webSocketService.subscribeToRejections(userId, (data: any) => {
      this.popupOkMessage = `Korisnik ${data.opponentNickname} je odbio Vaš izazov.`;
      this.isPopupOkOpen = true;
    });
  }

  subscribeToGameStart(userId: number): void {
    this.webSocketService.subscribeToGameStart(userId, (data: any) => {
  
      localStorage.setItem('gameId', data.gameId);
      
      const route = data.category === 'math' ? '/game-math/' : '/game-informatics/';
      this.router.navigate([route, data.gameId]); 
    });
  }

}
