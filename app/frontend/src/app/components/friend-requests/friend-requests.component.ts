import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [RouterModule, NavbarComponent],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.scss'
})
export class FriendRequestsComponent {

}
