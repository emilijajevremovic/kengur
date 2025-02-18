import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { TaskService } from '../../services/task.service';
import { environment } from '../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-game-math',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, MatTooltipModule],
  templateUrl: './game-math.component.html',
  styleUrl: './game-math.component.scss',
})
export class GameMathComponent implements OnInit, OnDestroy {
  constructor(
    private websocketService: WebsocketService,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private router: Router
  ) {}

  currentQuestionIndex = 0;
  totalQuestions = 9;
  isLastQuestion = false;
  selectedAnswerIndex: number | null = null;
  tasks: any[] = [];
  taskImagesUrl = environment.taskImagesUrl;
  selectedAnswers: { taskId: string; selectedIndex: number | null }[] = [];

  startDate: Date | null = null;
  endDate: Date | null = null;
  duration: string = '';

  ngOnInit() {
    this.startDate = new Date();

    this.route.params.subscribe((params) => {
      const gameId = params['gameId'];

      if (gameId) {
        this.validateGameAccess(gameId);
        this.taskService.getGameTasks(gameId).subscribe({
          next: (response) => {
            this.tasks = response;
          },
          error: (err) => console.error('Greška pri dohvatanju zadataka:', err),
        });
      }

      this.websocketService.subscribeToPlayerDisconnect(gameId, (data: any) => {
        alert(`Igrač sa ID ${data.userId} je napustio meč!`);
      });
    });

    window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngOnDestroy(): void {
    //localStorage.removeItem('gameId');
  }

  validateGameAccess(gameId: string) {
    this.taskService.validateGameAccess(gameId).subscribe({
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  get currentTask() {
    return this.tasks && this.tasks.length > 0
      ? this.tasks[this.currentQuestionIndex]
      : null;
  }

  selectAnswer(index: number) {
    this.selectedAnswerIndex = index;

    const currentTaskId = this.tasks[this.currentQuestionIndex]._id;

    const existingAnswer = this.selectedAnswers.find(
      (a) => a.taskId === currentTaskId
    );

    if (existingAnswer) {
      existingAnswer.selectedIndex = index;
    } else {
      this.selectedAnswers.push({
        taskId: currentTaskId,
        selectedIndex: index,
      });
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.tasks.length - 1) {
      this.currentQuestionIndex++;
      this.restoreSelectedAnswer();
    }
    if (this.currentQuestionIndex == this.tasks.length - 1) {
      this.isLastQuestion = true;
    }
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.isLastQuestion = false;
      this.restoreSelectedAnswer();
    }
  }

  restoreSelectedAnswer() {
    const currentTaskId = this.tasks[this.currentQuestionIndex]._id;
    const savedAnswer = this.selectedAnswers.find(
      (a) => a.taskId === currentTaskId
    );
    this.selectedAnswerIndex = savedAnswer ? savedAnswer.selectedIndex : null;
  }

  endQuiz() {
    this.endDate = new Date();
    this.calculateDuration();

    const gameId = localStorage.getItem('gameId');
    if (!gameId) return;

    const answersData = {
      answers: this.selectedAnswers,
    };

    this.taskService.checkAnswers(gameId, answersData).subscribe({
      next: (response: any) => {
        const finishGameData = {
          correctAnswers: response.correctAnswers,
          totalQuestions: response.totalQuestions,
          timeTaken: this.duration,
        };

        this.taskService.finishGame(gameId, finishGameData).subscribe({
          next: () => {
            //console.log('Game finished, event emitted.');
            this.router.navigate(['/lobby']);
          },
          error: (err) =>
            console.error('Greška pri slanju završetka igre:', err),
        });
      },
      error: (err) => console.error('Greška pri slanju odgovora:', err),
    });
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.tasks.length) {
      this.currentQuestionIndex = index;
    }
  }

  calculateDuration(): void {
    if (this.startDate && this.endDate) {
      const timeDifference = this.endDate.getTime() - this.startDate.getTime();
      const totalSeconds = Math.floor(timeDifference / 1000);
      this.duration = this.formatTime(totalSeconds);
      //console.log(this.duration);
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

  getSafeImageUrl(fileName: string): string {
    if (!fileName) return '';

    return encodeURI(
      `assets/TaskImages/${this.currentTask.class}/${this.currentTask.level}/${fileName}`
    );
  }
}
