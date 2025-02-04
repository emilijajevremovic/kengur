<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OnlineUsersUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $onlineUsers;

    public function __construct($onlineUsers)
    {
        $this->onlineUsers = array_values($onlineUsers);
    }

    public function broadcastOn()
    {
        return new Channel('online-users-channel');
    }

    public function broadcastAs()
    {
        return 'OnlineUsersUpdated';
    }
}
