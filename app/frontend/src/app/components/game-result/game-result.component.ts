import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-game-result',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './game-result.component.html',
  styleUrl: './game-result.component.scss'
})
export class GameResultComponent implements OnInit, OnDestroy {

  pollingInterval: any;
  matchResults: any;

  constructor(private route: ActivatedRoute, private taskService: TaskService, private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const gameId = params['gameId'];
    });
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

}
