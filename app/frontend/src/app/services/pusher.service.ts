import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PusherService {
  pusher: Pusher;
  private authToken: string | null = null;
  baseUrl = environment.apiUrl;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.authToken = localStorage.getItem('auth_token');
    }

    this.pusher = new Pusher('ABCDEF', {
      // TS traži cluster polje – postavi bilo koju vrednost (npr. 'mt1').
      cluster: 'mt1',

      wsHost: 'imi.pmf.kg.ac.rs',
      wsPort: 443,
      wssPort: 443,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      wsPath: '/imi-math-code-duel/app-ws',
      disableStats: true,

      authEndpoint: `${this.baseUrl}/api/broadcasting/auth`, 
      auth: {
        headers: () => ({
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`
        })
      }
    });
  }

  subscribeToChannel(channelName: string) {
    return this.pusher.subscribe(channelName);
  }

  disconnect() {
    this.pusher.disconnect();
  }
}
