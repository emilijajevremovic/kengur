import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as CodeMirror from 'codemirror';
import { HttpClient } from '@angular/common/http';
import 'codemirror/lib/codemirror.css';
import { TaskService } from '../../services/task.service';
import { WebsocketService } from '../../services/websocket.service';
import { PopupOkComponent } from '../popup-ok/popup-ok.component';
import { PopupYesNoComponent } from '../../popup-yes-no/popup-yes-no.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-game-inf',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, FormsModule, PopupOkComponent, PopupYesNoComponent],
  templateUrl: './game-inf.component.html',
  styleUrls: ['./game-inf.component.scss'],
})
export class GameInfComponent implements OnInit, AfterViewInit {
  startDate: Date | null = null;
  endDate: Date | null = null;
  duration: string = '';
  input: string = ''; // Opcioni ulaz
  language: string = 'c'; // Odabrani jezik
  result: string = ''; // Rezultat izvršavanja
  editor: CodeMirror.EditorFromTextArea | null = null;

  @ViewChild('editor') editorElement!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  gameId: any = null;
  isGameFinished: boolean = false;
  isPopupOkOpen: boolean = false;
  popupOkMessage: string = '';
  showPopupYesNo: boolean = false;
  popupYesNoMessage: string = '';
  task: any = null;
  baseUrl = environment.apiUrl;
  timerMinutes: number = 30;
  timerSeconds: number = 0;
  private timerInterval: any;

  ngOnInit() {
    this.startDate = new Date();
    this.startTimer();

    this.route.params.subscribe((params) => {
      const gameId = params['gameId'];

      if (gameId) {
        this.gameId = gameId;
        this.validateGameAccess(gameId);

        this.taskService.getInformaticsGameTask(gameId).subscribe({
          next: (response) => {
            this.task = response;
          },
          error: (err) => console.error('Greška pri dohvatanju zadatka:', err),
        });
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeunload', this.handlePageExit);

      this.router.events.subscribe((event) => {
        if (event.constructor.name === 'NavigationStart') {
          this.handlePageExit();
        }
      });
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds === 0) {
        if (this.timerMinutes === 0) {
          clearInterval(this.timerInterval);
          this.endQuiz(); // Kada istekne vreme
        } else {
          this.timerMinutes--;
          this.timerSeconds = 59;
        }
      } else {
        this.timerSeconds--;
      }
    }, 1000);
  }

  validateGameAccess(gameId: string) {
    this.taskService.validateGameAccess(gameId).subscribe({
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  handlePageExit = () => {
    if (!this.gameId) return;
    if (this.isGameFinished) return;
    this.forfeitGame();
  };

  forfeitGame = () => {
    if (!this.gameId) return;

    fetch(`${this.taskService.baseUrl}/api/forfeit-game/${this.gameId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        correctAnswers: 0,
        totalQuestions: 9,
        timeTaken: '-1',
      }),
      keepalive: true,
    })
      .then((response) => response.json())
      .then((data) => {
        this.isGameFinished = true;
        this.popupOkMessage = 'Predali ste meč.';
        this.isPopupOkOpen = true;
      })
      .catch((error) => console.error('Greška pri predaji meča:', error));
  };

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      Promise.all([
        import('codemirror'),
        import('codemirror/addon/edit/closebrackets'),
        // @ts-ignore
        import('codemirror/mode/clike/clike'),
        // @ts-ignore
        import('codemirror/mode/python/python'),
      ]).then(([CodeMirror]) => {
        this.editor = CodeMirror.fromTextArea(
          this.editorElement.nativeElement,
          {
            lineNumbers: true,
            mode: 'text/x-csrc',
            theme: 'default',
            autoCloseBrackets: true,
          } as any
        );

        const width = window.innerWidth;
        this.editor.setSize(0.7 * width + 'px', '500px');
      });
    }
  }

  changeLanguage(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (this.editor) {
      let mode = 'text/x-csrc'; // Default to C
      if (selectedValue === 'cpp') {
        mode = 'text/x-c++src';
      } else if (selectedValue === 'python') {
        mode = 'text/x-python';
      }

      this.editor.setOption('mode', mode);
    }
  }

  runCode() {
    const payload = {
      code: this.editor?.getValue(),
      input: this.input,
      language: this.language,
    };

    //console.log(payload);
    this.http
      .post<any>(`${this.taskService.baseUrl}/execute-code`, payload)
      .subscribe(
        (response) => {
          if (response.error) {
            this.result = `Error: ${response.error}`;
          } else {
            this.result = `${response.output}`;
          }
        },
        (error) => {
          //console.log(error);
          this.result = error.error.text;
        }
      );
    this.input = '';
  }

  endQuiz() {
    this.showPopupYesNo = true;
    this.endDate = new Date();
    this.calculateDuration();

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

  
    if (!this.gameId) return;
  
    const code = this.editor?.getValue();
    const language = this.language;
    const duration = this.duration;
  
    if (!code) {
      this.popupOkMessage = "Molimo unesite kod pre predaje!";
      this.isPopupOkOpen = true;
      return;
    }
  
    this.taskService.submitInformaticsGameResult(this.gameId, code, language, duration).subscribe({
      next: (response) => {
        const finishGameData = {
          correctAnswers: response.correctAnswers,
          totalQuestions: response.totalQuestions,
          timeTaken: this.duration,
        };
  
        this.taskService.finishGame(this.gameId, finishGameData).subscribe({
          next: () => {
            this.isGameFinished = true;
            this.router.navigate(['/lobby']); 
          },
          error: (err) =>
            console.error("Greška pri slanju završetka igre:", err),
        });
      },
      error: (err) => {
        console.error("Greška pri predaji rešenja:", err);
        this.popupOkMessage = "Došlo je do greške, pokušajte ponovo!";
        this.isPopupOkOpen = true;
      }
    });
  }
  

  subscribeToGameFinish(): void {
    this.websocketService.subscribeToGameFinish(this.gameId, (data: any) => {
      this.isGameFinished = true;
      this.popupOkMessage = `Igra je završena! 
      Igrač 1: ${data.player1.correctAnswers}/${data.player1.totalQuestions} 
      Igrač 2: ${data.player2.correctAnswers}/${data.player2.totalQuestions}`;
      this.isPopupOkOpen = true;
  
      setTimeout(() => {
        this.router.navigate(['/lobby']);
      }, 5000);
    });
  }
  

  calculateDuration(): void {
    if (this.startDate && this.endDate) {
      const timeDifference = this.endDate.getTime() - this.startDate.getTime();
      const totalSeconds = Math.floor(timeDifference / 1000);
      this.duration = this.formatTime(totalSeconds);
    }
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${this.formatNumber(hours)}:${this.formatNumber(
        minutes % 60
      )}:${this.formatNumber(seconds)}`;
    }

    return `${this.formatNumber(minutes)}:${this.formatNumber(seconds)}`;
  }

  formatNumber(time: number): string {
    return time < 10 ? '0' + time : time.toString();
  }

  popupYesNo() {
    this.showPopupYesNo = true;
  }

  getSafeImageUrl(fileName: string, taskClass: string): string {
    if (!fileName) return '';

    return encodeURI(`${this.baseUrl}/TaskImagesInformatics/${taskClass}/${fileName}`);
}

}
