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


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private userService: UserService, private authService: AuthService, private webSocketService: WebsocketService, private taskService: TaskService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('auth_token')) {
      this.userService.setUserOnline().subscribe({
        // next: (data) => console.log('Korisnik postavljen kao online:', data),
        // error: (error) => console.error('Greška pri postavljanju online statusa:', error)
      });

      window.addEventListener('beforeunload', this.setUserOffline.bind(this));

      this.authService.getUserData().subscribe({
        next: async (response) => {
          this.userId = response.user.id;
          this.myNickname = response.user.nickname;
          this.subscribeToChallenges(this.userId);
          
          await this.webSocketService.initPusherService();
          //console.log('PusherService je sada inicijalizovan');

          this.subscribeToRejections(this.userId);
          this.subscribeToGameStart(this.userId);
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
      //console.log(data);
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

  //console.log("Šaljemo podatke na backend:", challengeData);

  this.taskService.acceptChallenge(challengeData).subscribe({
    next: (response) => {
      //console.log('Izazov prihvaćen, čekamo GameStarted event...', response);
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
      //console.log(`Pokretanje igre za Game ID: ${data.gameId}, Kategorija: ${data.category}, Razred: ${data.class}`);
  
      const route = data.category === 'math' ? '/game-math/' : '/game-informatics/';
      this.router.navigate([route, data.gameId]); 
    });
  }

}
