import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PusherService } from '../../services/pusher.service';
import { UserService } from '../../services/user.service';
import { TaskService } from '../../services/task.service';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    NgIf,
    CommonModule,
    FormsModule,
    MatTooltipModule,
    PopupOkComponent,
  ],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.scss',
})
export class FriendRequestsComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private pusherService: PusherService,
    private userService: UserService,
    private taskService: TaskService
  ) {}

  baseUrl = environment.apiUrl;
  searchQuery: string = '';
  isPopupOpen = false;
  isPopup2Open = false;
  isPopup3Open = false;
  isPopupOkOpen = false;
  popupOkMessage = '';
  searchedUsers: any[] = [];
  searchPerformed = false;
  selectedUser: any;
  selectedRequest: any;
  opponent: any;
  friendRequests: any = [];
  users: any[] = [];
  onlineUsers: string[] = [];
  selectedSubject: string = 'math';
  distinctClassesMath: string[] = [];
  distinctClassesInformatics: string[] = [];
  classSelected: string = '';
  user: any = {};
  friends: string[] = [];

  selectedSubjectAdmin: string = 'math';
  taskText: string = '';
  taskPicture: File | null = null;
  taskClass: string = '';
  taskLevel: number = 3;
  answerType: string = 'text';
  answersText: string[] = [''];
  answersPictures: File[] = [];
  correctAnswerIndex: number | null = 0;
  testCases: { input: string; output: string }[] = [{ input: '', output: '' }];

  ngOnInit(): void {
    this.userService.setUserOnline().subscribe({
      // next: (data) => console.log('Korisnik postavljen kao online:', data),
      // error: (error) => console.error('Greška pri postavljanju online statusa:', error)
    });

    const channel = this.pusherService.subscribeToChannel(
      'online-users-channel'
    );

    channel.bind('OnlineUsersUpdated', (data: any) => {
      if (data.onlineUsers && Array.isArray(data.onlineUsers)) {
        this.onlineUsers = data.onlineUsers.map((id: number) => id.toString());
        //console.log('Ažurirana lista online korisnika:', this.onlineUsers);
        this.updateUserLists();
      } else {
        console.error('Stigao neispravan WebSocket događaj:', data);
      }
      this.updateUserLists();
    });

    this.fetchOnlineUsers();
    this.loadFriendRequests();
    this.fetchUsers();
    this.loadMathClasses();
    this.loadInformaticsClasses();

    this.userService.getFriends().subscribe((friends) => {
      this.friends = friends.map((id: number) => id.toString());
      this.updateUserLists();
    });

    const userId = this.authService.getUserId();
    const privateChannel = this.pusherService.subscribeToChannel(
      `user.${userId}`
    );

    privateChannel.bind('ChallengeUser', (data: any) => {
      alert(
        `${data.challengerName} izaziva te na meč iz ${data.category} za razred ${data.class}`
      );
    });

    this.authService.getUserData().subscribe({
      next: (data) => {
        this.user = data.user.nickname;
      },
      error: (error) => {
        //console.error('Error fetching user data:', error);
      },
    });
  }

  sendChallenge(): void {
    const challengeData = {
      challenger_name: this.user,
      opponent_id: this.opponent.id,
      category: this.selectedSubject,
      class: this.classSelected,
    };

    this.taskService.sendChallenge(challengeData).subscribe({
      next: () => {
        this.snackBar.open('Izazov uspešno poslat.', 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
        });
      },
      error: (err) => {
        //console.error('Greška prilikom slanja izazova:', err);
      },
    });

    this.closePopup();
  }

  loadMathClasses(): void {
    this.taskService.getDistinctClassesMath().subscribe((data) => {
      this.distinctClassesMath = data
        .map((cls) => JSON.parse(cls))
        .sort((a, b) => this.compareClasses(a[0], b[0]));
      //console.log(this.distinctClassesMath);
      if (
        this.selectedSubject == 'math' &&
        this.distinctClassesMath.length > 0
      ) {
        this.classSelected = this.distinctClassesMath[0][0];
      }
    });
  }

  compareClasses(classA: string, classB: string): number {
    const numA = classA.split('-').map(Number);
    const numB = classB.split('-').map(Number);

    return numA[0] - numB[0];
  }

  loadInformaticsClasses(): void {
    this.taskService.getDistinctClassesInformatics().subscribe((data) => {
      this.distinctClassesInformatics = data.map((cls) => JSON.parse(cls));
      //console.log(this.distinctClassesInformatics);

      if (
        this.selectedSubject == 'informatics' &&
        this.distinctClassesInformatics.length > 0
      ) {
        this.classSelected = this.distinctClassesInformatics[0][0];
      }
    });
  }

  onSubjectChange(subject: string): void {
    this.selectedSubject = subject;
    if (this.selectedSubject == 'math' && this.distinctClassesMath.length > 0) {
      this.classSelected = this.distinctClassesMath[0][0];
    }
    if (
      this.selectedSubject == 'info' &&
      this.distinctClassesInformatics.length > 0
    ) {
      this.classSelected = this.distinctClassesInformatics[0][0];
    }
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      //console.log(users);
      this.updateUserLists();
    });
  }

  fetchOnlineUsers(): void {
    this.userService.getOnlineUsers().subscribe((users) => {
      this.onlineUsers = users.map((user: any) => user.id.toString());
      this.updateUserLists();
    });
  }

  updateUserLists(): void {
    this.users.forEach((user) => {
      user.is_online = this.onlineUsers.includes(user.id.toString());
      user.is_friend = this.friends.includes(user.id.toString());
    });

    this.users.sort((a, b) => {
      return (
        Number(b.is_online) - Number(a.is_online) ||
        Number(b.is_friend) - Number(a.is_friend)
      );
    });

    this.updateInGameUsers();
  }

  updateInGameUsers() {
    this.userService.getInGameUsers().subscribe({
      next: (usersInGame) => {
        this.users.forEach((user) => {
          const matchingUser = usersInGame.find(
            (gameUser: any) => gameUser.id === user.id
          );
          user.game = matchingUser ? matchingUser.game : false;
        });
      },
      error: (err) =>
        console.error('Greška pri dohvatanju igrača u igri:', err),
    });
  }

  searchUsers() {
    this.searchPerformed = false;
    if (this.searchQuery.trim()) {
      this.authService.getUserByNickname(this.searchQuery).subscribe({
        next: (response) => {
          this.searchedUsers = response;
          this.searchPerformed = true;
        },
        error: (error) => {
          this.searchPerformed = true;
          this.searchedUsers = [];
          //console.error('Greška prilikom pretrage:', error);
          //console.log('Detalji greške:', error?.error);
        },
      });
    } else {
      this.searchPerformed = false;
      this.searchedUsers = [];
      this.snackBar.open('Unesite korisničko ime za pretragu.', 'OK', {
        duration: 5000,
        panelClass: ['light-snackbar'],
      });
    }
  }

  addFriend(user: any) {
    this.authService.sendFriendRequest(user.id).subscribe({
      next: (response) => {
        this.snackBar.open('Zahtev za prijateljstvo je poslat.', 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
        });
      },
      error: (error) => {
        if (error.status === 400) {
          this.snackBar.open('Već ste poslali zahtev ovom korisniku.', 'OK', {
            duration: 5000,
            panelClass: ['light-snackbar'],
          });
        } else {
          this.snackBar.open('Došlo je do greške, pokušajte ponovo.', 'OK', {
            duration: 5000,
            panelClass: ['light-snackbar'],
          });
        }
      },
    });
  }

  loadFriendRequests() {
    this.authService.getFriendRequests().subscribe({
      next: (requests) => {
        this.friendRequests = requests;
        //console.log(this.friendRequests);
      },
      error: (error) => {
        console.error('Greška pri dobijanju zahteva:', error);
      },
    });
  }

  acceptRequest(id: any) {
    this.authService.acceptFriendRequest(id).subscribe({
      next: (requests) => {
        this.snackBar.open('Prihvatili ste zahtev za prijateljstvo.', 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
        });
      },
      error: (error) => {
        this.snackBar.open('Došlo je do greške, pokušajte ponovo.', 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
        });
      },
    });
  }

  rejectRequest(id: any) {
    this.authService.rejectFriendRequest(id).subscribe({
      next: (requests) => {
        this.loadFriendRequests();
        this.snackBar.open('Odbili ste zahtev za prijateljstvo.', 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
        });
      },
      error: (error) => {
        this.loadFriendRequests();
        this.snackBar.open('Došlo je do greške, pokušajte ponovo.', 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
        });
      },
    });
  }

  showMore(user: any) {
    this.selectedUser = user;
    //console.log(this.selectedUser.profile_picture);
    this.isPopup2Open = true;
  }

  showMoreAboutRequest(user: any) {
    this.selectedRequest = user;
    //console.log(this.selectedRequest);
    this.isPopup3Open = true;
  }

  openPopup(user: any) {
    if (user.game) {
      this.isPopupOkOpen = true;
    } else {
      this.opponent = user;
      this.isPopupOpen = true;
    }
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  closePopup2() {
    this.isPopup2Open = false;
  }

  closePopup3() {
    this.isPopup3Open = false;
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }


  onSubjectChangeAdmin(subject: string) {
    this.selectedSubjectAdmin = subject;
    this.resetForm();
  }

  onFileSelect(event: any) {
    this.taskPicture = event.target.files[0];
  }

  onAnswerImageSelect(event: any, index: number) {
    this.answersPictures[index] = event.target.files[0];
  }

  onFileSelected(event: any, index: number) {
    if (event.target.files.length > 0) {
      this.answersPictures[index] = event.target.files[0]; 
    }
  }

  addTextAnswer() {
    this.answersText.push('');
    if (this.correctAnswerIndex === null) {
      this.correctAnswerIndex = 0;
    }
  }
  
  addImageAnswer() {
    this.answersPictures.push(new File([], ''));
    if (this.correctAnswerIndex === null) {
      this.correctAnswerIndex = 0;
    }
  }

  addTestCase() {
    this.testCases.push({ input: '', output: '' });
  }

  resetForm() {
    this.taskText = '';
    this.taskPicture = null;
    this.taskClass = '';
    this.taskLevel = 3;
    this.answerType = 'text';
    this.answersText = [''];
    this.answersPictures = [];
    this.correctAnswerIndex = null;
    this.testCases = [{ input: '', output: '' }];
  }

  submitTask() {
    const formData = new FormData();
    formData.append('taskText', this.taskText);
    
    if (this.taskPicture) {
      formData.append('taskPicture', this.taskPicture.name); // Čuvamo samo naziv slike
    }

    formData.append('class', this.taskClass);

    if (this.selectedSubjectAdmin === 'math') {
      formData.append('level', this.taskLevel.toString());
      formData.append('answerType', this.answerType);
      if (this.answerType === 'text') {
        formData.append('answersText', JSON.stringify(this.answersText));
      } else {
        const pictureNames = this.answersPictures.map(file => file.name); // Samo nazivi slika
        formData.append('answersPictures', JSON.stringify(pictureNames));
      }
      formData.append('correctAnswerIndex', this.correctAnswerIndex!.toString());

      this.taskService.addMathTask(formData).subscribe({
        next: () => alert('Matematički zadatak uspešno dodat!'),
        error: (err) => console.error('Greška pri dodavanju zadatka:', err),
      });
    } else {
      //formData.append('testCases', JSON.stringify(this.testCases)); // Ispravljen način slanja testCases
      this.testCases.forEach((test, index) => {
        formData.append(`testCases[${index}][input]`, test.input);
        formData.append(`testCases[${index}][output]`, test.output);
      });

      this.taskService.addInformaticsTask(formData).subscribe({
        next: () => alert('Zadatak iz informatike uspešno dodat!'),
        error: (err) => console.error('Greška pri dodavanju zadatka:', err),
      });
    }
  }


  printFormData(formData: FormData) {
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
  }
  
  
}
