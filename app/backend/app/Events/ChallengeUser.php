<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChallengeUser implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $challengerName;
    public $category;
    public $class;
    public $opponentId;

    public function __construct($challengerName, $opponentId, $category, $class)
    {
        $this->challengerName = $challengerName;
        $this->category = $category;
        $this->class = $class;
        $this->opponentId = $opponentId; 
        $this->dontBroadcastToCurrentUser();
    }

    public function broadcastOn()
    {
        return new Channel('user.' . $this->opponentId);
    }

    public function broadcastAs()
    {
        return 'ChallengeReceived';
    }
}
