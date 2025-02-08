import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PusherService } from './pusher.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private pusherService!: PusherService; 

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async initPusherService() {
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
      console.log('Primljen izazov:', data);
      callback(data);
    });
  }
}
