import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  users = [
    { name: 'Ana', status: 'online', profileImage: '' },
    { name: 'Marko', status: 'offline', profileImage: '' },
    { name: 'Ivana', status: 'online', profileImage: '' },
  ];

  selectedUser: any = null;
  selectedGrade: string = '';
  selectedSubject: string = '';

  challengeUser(user: any) {
    this.selectedUser = user;
    console.log(`Izabrani korisnik: ${user.name}`);
  }

  sendChallenge() {
    if (this.selectedUser && this.selectedGrade && this.selectedSubject) {
      console.log(
        `Izazov poslat korisniku: ${this.selectedUser.name}, Razred: ${this.selectedGrade}, Predmet: ${this.selectedSubject}`
      );
    } else {
      console.log('Molimo popunite sve podatke pre slanja izazova.');
    }
  }

}
