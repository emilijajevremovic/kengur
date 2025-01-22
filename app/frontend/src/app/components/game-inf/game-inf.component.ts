import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css'; 

@Component({
  selector: 'app-game-inf',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, FormsModule],
  templateUrl: './game-inf.component.html',
  styleUrls: ['./game-inf.component.scss']
})
export class GameInfComponent implements OnInit, AfterViewInit {
  startDate: Date | null = null;
  endDate: Date | null = null;
  duration: string = '';
  editor: CodeMirror.EditorFromTextArea | null = null;

  @ViewChild('editor') editorElement!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
        this.editor = CodeMirror.fromTextArea(this.editorElement.nativeElement, {
          lineNumbers: true,
          mode: 'text/x-csrc',
          theme: 'default',
          autoCloseBrackets: true,
        } as any);
  
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

  ngOnInit() {
    this.startDate = new Date();
    //console.log('Start time:', this.startDate);
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

  task: any = this.tasks[0];

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
