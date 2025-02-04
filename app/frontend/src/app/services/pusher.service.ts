import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PusherService {
  pusher: Pusher;
  baseUrl = environment.apiUrl;

  constructor() {
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // Autentifikacija pomoću tokena
        }
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
