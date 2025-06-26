import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  pusher: Pusher;
  private authToken: string | null = null;
  baseUrl = environment.apiUrl;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.authToken = localStorage.getItem('auth_token'); 
    }
    
    this.pusher = new Pusher('ABCDEF', {
      cluster: 'mt1',
      wsHost: '127.0.0.1',
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${this.baseUrl}/api/broadcasting/auth`, // Omogućava autentifikaciju
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
