import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WebsocketService } from '../../services/websocket.service';
import { TaskService } from '../../services/task.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-game-math',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule],
  templateUrl: './game-math.component.html',
  styleUrl: './game-math.component.scss'
})
export class GameMathComponent implements OnInit, OnDestroy {

  constructor(private websocketService: WebsocketService, private route: ActivatedRoute, private taskService: TaskService, private router: Router) {}

  currentQuestionIndex = 0;
  totalQuestions = 9;
  isLastQuestion = false;
  selectedAnswerIndex: number | null = null; 
  tasks: any[] = [];
  taskImagesUrl = environment.taskImagesUrl;

  startDate: Date | null = null;
  endDate: Date | null = null;
  duration: string = '';


  ngOnInit() {
    this.startDate = new Date();
    
    this.route.params.subscribe(params => {
      const gameId = params['gameId'];

      if (gameId) {
        this.validateGameAccess(gameId);
        this.taskService.getGameTasks(gameId).subscribe({
          next: (response) => {
            //this.tasks = response.tasks;
            // this.totalQuestions = this.tasks.length;
            console.log(response);
            this.tasks = response;
          },
          error: (err) => console.error("Greška pri dohvatanju zadataka:", err)
        });
      }

      this.websocketService.subscribeToPlayerDisconnect(gameId, (data: any) => {
          alert(`Igrač sa ID ${data.userId} je napustio meč!`);
      });
    });

    window.onbeforeunload = () => this.ngOnDestroy();

  }

  ngOnDestroy(): void {
    localStorage.removeItem('gameId');
  }

  validateGameAccess(gameId: string) {
    this.taskService.validateGameAccess(gameId).subscribe({
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }

  get currentTask() {
    return this.tasks && this.tasks.length > 0 ? this.tasks[0] : null;
  }

  selectAnswer(index: number) {
    this.selectedAnswerIndex = index; 
    //console.log('Selected answer index:', index);
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.tasks.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswerIndex = null; 
    } 
    else {
      this.endQuiz();
    }
  }

  endQuiz() {
    this.endDate = new Date(); 
    //console.log('End time:', this.endDate);
    this.calculateDuration();
    localStorage.removeItem('game_id');
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
      return `${this.formatNumber(hours)}:${this.formatNumber(minutes % 60)}:${this.formatNumber(seconds)}`;
    }
    
    return `${this.formatNumber(minutes)}:${this.formatNumber(seconds)}`;
  }

  formatNumber(time: number): string {
    return time < 10 ? '0' + time : time.toString();
  }
}
