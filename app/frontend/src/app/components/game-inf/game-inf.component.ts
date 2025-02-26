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

@Component({
  selector: 'app-game-inf',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, FormsModule],
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
    private router: Router
  ) {}

  gameId: any = null;
  isGameFinished: boolean = false;
  isPopupOkOpen: boolean = false;
  popupOkMessage: string = '';
  task: any = null;

  ngOnInit() {
    this.startDate = new Date();

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
    }
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
    this.endDate = new Date();
    //console.log('End time:', this.endDate);
    this.calculateDuration();
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
}
