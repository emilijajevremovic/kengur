import { Component, OnInit } from '@angular/core';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { PopupYesNoComponent } from '../popup-yes-no/popup-yes-no.component';

declare var MathJax: any;

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    MatTooltipModule,
    PopupYesNoComponent
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})

export class AdminHomeComponent implements OnInit{

  constructor(private taskService: TaskService, private userService: UserService, private snackBar: MatSnackBar) {}

  selectedSubject: string = 'math';
  distinctClassesMath: string[] = [];
  distinctClassesInformatics: string[] = [];
  selectedSubjectAdmin: string = 'math';
  taskText: string = '';
  taskPicture: File | null = null;
  taskClass: string = '';
  taskLevel: number = 3;
  answerType: string = 'text';
  numberOfAnswers: number = 0;
  answersText: string[] = [''];
  answersPictures: File[] = [];
  correctAnswerIndex: number | null = 0;
  testCases: { input: string; output: string }[] = [{ input: '', output: '' }];
  selectedTopic: any = 'tasks';
  userListAdmin: any[] = [];
  classSelected: string = '';
  nameFilter: string = ''; 
  surnameFilter: string = ''; 
  schoolFilter: string = ''; 
  cityFilter: string = '';
  classFilter: number | null = null;
  mathGradeFilter: number | null = null;
  infoGradeFilter: number | null = null;
  winsFilter: number = 0; 
  lossesFilter: number = 0; 
  userType: string = 'student';
  setUserType: string = 'student';
  showPopup: boolean = false;
  popupMessage: string = '';
  popupAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadMathClasses();
    this.loadInformaticsClasses();
    this.userService.getUsersAdmin().subscribe((response: any) => {
      this.userListAdmin = response; 
    });
  }

  renderMath() {
    if (typeof MathJax !== 'undefined') {
      setTimeout(() => {
        MathJax.typesetPromise();
      }, 0);
    }
  }
  

  loadMathClasses(): void {
    this.taskService.getDistinctClassesMath().subscribe((data) => {
      this.distinctClassesMath = data
        .map((cls) => JSON.parse(cls))
        .sort((a, b) => this.compareClasses(a[0], b[0]));
      //console.log(this.distinctClassesMath);
      if (this.selectedSubject == 'math' && this.distinctClassesMath.length > 0) {
        this.classSelected = this.distinctClassesMath[0][0];
        this.taskClass = this.distinctClassesMath[0][0];
      }
    });
  }

  loadInformaticsClasses(): void {
    this.taskService.getDistinctClassesInformatics().subscribe((data) => {
      this.distinctClassesInformatics = data.map((cls) => JSON.parse(cls));
      //console.log(this.distinctClassesInformatics);

      if (this.selectedSubject == 'informatics' && this.distinctClassesInformatics.length > 0) {
        this.classSelected = this.distinctClassesInformatics[0][0];
      }
    });
  }

  compareClasses(classA: string, classB: string): number {
    const numA = classA.split('-').map(Number);
    const numB = classB.split('-').map(Number);

    return numA[0] - numB[0];
  }

  onSubjectChangeAdmin(subject: string) {
    this.selectedSubjectAdmin = subject;
    this.resetForm();
    
    if(subject == 'math') {
      this.taskClass = this.distinctClassesMath[0][0];
    }
    else {
      this.taskClass = this.distinctClassesInformatics[0][0];
    }
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

  generateAnswers() {
    this.answersText = Array(this.numberOfAnswers).fill('');
    this.correctAnswerIndex = 0; 
  }

  addTextAnswer() {
    this.answersText.push('');
    if (this.correctAnswerIndex === null) {
      this.correctAnswerIndex = 0;
    }
  }

  removeTextAnswer(index: number) {
    this.answersText.splice(index, 1); 
    if (this.correctAnswerIndex || 0 >= this.answersText.length) {
      this.correctAnswerIndex = null; 
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
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
    const normalizedClass = this.normalizeClassName(this.taskClass);
    formData.append('class', normalizedClass);

    if (this.taskPicture) {
        formData.append('taskPicture', this.taskPicture);
    }

    if (this.selectedSubjectAdmin === 'math') {
        formData.append('level', this.taskLevel.toString());
        formData.append('answerType', this.answerType);

        if (this.answerType === 'text') {
            this.answersText.forEach((answer, index) => {
                formData.append(`answersText[${index}]`, answer);
            });
        } else {
            this.answersPictures.forEach((file, index) => {
                formData.append(`answersPictures[${index}]`, file);
            });
        }

        if (this.correctAnswerIndex !== null && this.correctAnswerIndex !== undefined) {
            formData.append('correctAnswerIndex', this.correctAnswerIndex.toString());
        } else {
          this.snackBar.open('Morate označiti tačan odgovor!', 'OK', {
            duration: 5000,
            panelClass: ['light-snackbar'],
          });
          return; 
        }

        this.taskService.addMathTask(formData).subscribe({
            next: () => {
              this.resetForm();
                this.snackBar.open('Zadatak uspešno dodat!', 'OK', {
                    duration: 5000,
                    panelClass: ['light-snackbar'],
                });
            },
            error: (err) => console.error('Greška pri dodavanju zadatka:', err),
        });
    } else {
        formData.append('testCases', JSON.stringify(this.testCases));

        this.taskService.addInformaticsTask(formData).subscribe({
            next: () => {
                this.resetForm();
                this.snackBar.open('Zadatak uspešno dodat!', 'OK', {
                    duration: 5000,
                    panelClass: ['light-snackbar'],
                });
            },
            error: (err) => console.error('Greška pri dodavanju zadatka:', err),
        });
    }
}


  getAvailableClasses(): string[] {
    return this.selectedSubjectAdmin === 'math' ? this.distinctClassesMath : this.distinctClassesInformatics;
  }

  normalizeClassName(className: string): string {
    if (className.toLowerCase() === "srednja skola") {
        return "SrednjaSkola"; 
    }
    return className; 
  }

  printFormData(formData: FormData) {
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
  }
  
  changeTopic(topic: any) {
    this.selectedTopic = topic;
  }

  search() {
    this.setUserType = this.userType;
    this.userService.getUsersAdminFilter(this.nameFilter, this.surnameFilter, this.cityFilter, this.schoolFilter, this.winsFilter, this.lossesFilter, this.classFilter, this.mathGradeFilter, this.infoGradeFilter, this.userType).subscribe(users => {
      this.userListAdmin = users;
    });
  }

  exportToCSV() {
    const headers = Array.from(document.querySelectorAll('thead th')).map(th => th.textContent?.trim());
    
    const rows = Array.from(document.querySelectorAll('tbody tr')).map(tr => {
      return Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent?.trim());
    });
  
    let csvContent = [headers.join(',')];
    rows.forEach(row => {
      csvContent.push(row.join(','));
    });
  
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Korisnici.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  sortBy(key: string, descending: boolean = false): void {
    this.userListAdmin.sort((a: any, b: any) => {
      let aValue = key === 'matches' ? (a.wins || 0) + (a.losses || 0) : a[key] || 0;
      let bValue = key === 'matches' ? (b.wins || 0) + (b.losses || 0) : b[key] || 0;
      return descending ? bValue - aValue : aValue - bValue;
    });
  }  

  makeAdmin(user: any) {
    this.popupMessage = `Da li želite da korisnik ${user.name} ${user.surname} postane admin?`;
    this.popupAction = () => {
      this.userService.makeAdmin(user.id).subscribe({
        next: () => {
          this.snackBar.open(`Korisnik ${user.name} ${user.surname} je sada admin.`, 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
          });
          this.search();
        },
        error: (err) => {
          console.error('Greška prilikom promene u admina:', err);
        }
      });
    };
    this.showPopup = true;
  }

  deleteUser(user: any) {
    this.popupMessage = `Da li ste sigurni da želite da obrišete korisnika ${user.name} ${user.surname}?`;
    this.popupAction = () => {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`Korisnik ${user.name} ${user.surname} je obrisan.`, 'OK', {
          duration: 5000,
          panelClass: ['light-snackbar'],
          });
          this.search();
        },
        error: (err) => {
          console.error('Greška prilikom brisanja korisnika:', err);
        }
      });
    };
    this.showPopup = true;
  }

  onPopupClose() {
    this.showPopup = false;
  }

  onPopupConfirm() {
    if (this.popupAction) {
      this.popupAction();
    }
    this.showPopup = false;
  }

}
