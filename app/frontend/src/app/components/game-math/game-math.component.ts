import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { interval } from 'rxjs';

@Component({
  selector: 'app-game-math',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule],
  templateUrl: './game-math.component.html',
  styleUrl: './game-math.component.scss'
})
export class GameMathComponent implements OnInit {

  currentQuestionIndex = 0;
  totalQuestions = 8;
  isLastQuestion = false;
  selectedAnswerIndex: number | null = null; 

  startDate: Date | null = null;
  endDate: Date | null = null;
  duration: string = '';

  ngOnInit() {
    this.startDate = new Date();
    console.log('Start time:', this.startDate);
  }

  tasks = [
    {
      taskText: 'Koliko ima krugova na slici desno?',
      taskPicture: 'maths.png',
      answersText: ['5', '6', '7', '8', '9'],
      answersPictures: [],
      correctAnswerIndex: 3
    },
    // Add other tasks here
  ];

  get currentTask() {
    return this.tasks[this.currentQuestionIndex];
  }

  selectAnswer(index: number) {
    this.selectedAnswerIndex = index; 
    console.log('Selected answer index:', index);
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
    console.log('End time:', this.endDate);
    this.calculateDuration();
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
