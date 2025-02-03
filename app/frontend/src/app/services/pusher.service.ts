import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  pusher: Pusher;

  constructor() {
    this.pusher = new Pusher('ABCDEF', {
      cluster: 'mt1',
      wsHost: '127.0.0.1',
      wsPort: 6001,
      wssPort: 6001,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
    });
  }

  subscribeToChannel(channelName: string) {
    return this.pusher.subscribe(channelName);
  }

  disconnect() {
    this.pusher.disconnect();
  }
  
}
