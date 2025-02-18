import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PusherService } from './pusher.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private pusherService!: PusherService;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async initPusherService(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && !this.pusherService) {
      const module = await import('./pusher.service');
      this.pusherService = new module.PusherService(this.platformId);
    }
  }

  async subscribeToChallenge(userId: number, callback: (data: any) => void) {
    await this.initPusherService();

    if (!this.pusherService) {
      console.error('PusherService nije inicijalizovan!');
      return;
    }

    const channel = this.pusherService.subscribeToChannel(`user.${userId}`);

    channel.bind('ChallengeReceived', (data: any) => {
      callback(data);
    });
  }

  subscribeToRejections(userId: number, callback: (data: any) => void) {
    if (!this.pusherService) {
      console.error(
        'Greška: PusherService nije inicijalizovan pre poziva subscribeToRejections!'
      );
      return;
    }

    const channel = this.pusherService.subscribeToChannel(`user.${userId}`);
    //console.log(`Pretplaćen na kanal: private-user.${userId}`);

    channel.bind('ChallengeRejected', (data: any) => {
      //console.log('Odbijen izazov primljen preko WebSockets-a:', data);
      callback(data);
    });
  }

  subscribeToGameStart(userId: number, callback: (data: any) => void) {
    const channel = this.pusherService.subscribeToChannel(`user.${userId}`);

    //console.log(`Pretplaćen na kanal za pokretanje igre: user.${userId}`);

    channel.bind('GameStarted', (data: any) => {
      //console.log('GameStarted event primljen:', data);
      callback(data);
    });
  }

  subscribeToPlayerDisconnect(gameId: string, callback: (data: any) => void) {
    const channel = this.pusherService.subscribeToChannel(`game.${gameId}`);

    channel.bind('PlayerDisconnected', (data: any) => {
      //console.log('Igrač je napustio meč:', data);
      callback(data);
    });
  }

  subscribeToGameFinish(gameId: any, callback: (data: any) => void) {
    const channel = this.pusherService.subscribeToChannel(
      `game-results.${gameId}`
    );

    channel.bind('GameFinished', (data: any) => {
      //console.log('Igra završena:', data);
      callback(data);
    });
  }
}
