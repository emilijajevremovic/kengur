import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-game-inf',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, FormsModule],
  templateUrl: './game-inf.component.html',
  styleUrl: './game-inf.component.scss'
})
export class GameInfComponent implements OnInit {

  timeElapsed = 0; // Tajmer
  timerInterval: any;

  currentQuestionIndex = 0;
  totalQuestions = 8;
  isLastQuestion = false;
  selectedAnswerIndex: number | null = null; 

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval); // Čisti interval kada komponenta bude uništena
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  tasks = [
    {
      taskText: 'Napisi kod koji ce od zadatog ulaza da na izlazu napise zadatu recenicu unazad.',
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

  get minutes() {
    return Math.floor(this.timeElapsed / 60);
  }

  get seconds() {
    return this.timeElapsed % 60;
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
    clearInterval(this.timerInterval);
    console.log('Quiz ended!');
  }
}