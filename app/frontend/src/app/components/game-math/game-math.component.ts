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

  ngOnInit() {
    //this.startTimer();
    // const obs$ = interval(1000);
    // obs$.subscribe((d) => {
    //   this.timeElapsed++;
    //   this.seconds = this.timeElapsed % 60;
    //   this.minutes = Math.floor(this.timeElapsed / 60);
    //});
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  currentQuestionIndex = 0;
  totalQuestions = 8;
  timeElapsed = 0; // In seconds
  timerInterval: any;
  isLastQuestion = false;
  selectedAnswerIndex: number | null = null; 

  seconds = 0;
  minutes = 0;

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

  // get minutes() {
  //   return Math.floor(this.timeElapsed / 60);
  // }

  // get seconds() {
  //   return this.timeElapsed % 60;
  // }

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
    clearInterval(this.timerInterval);
    console.log('Quiz ended!');
  }
}
