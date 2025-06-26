<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\Log;

class ChallengeRejected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $challengerId; 
    public $opponentNickname; 

    public function __construct($challengerId, $opponentNickname)
    {
        $this->challengerId = $challengerId;
        $this->opponentNickname = $opponentNickname;
        $this->dontBroadcastToCurrentUser();
    }

    public function broadcastOn()
    {
        return new Channel('user.' . $this->challengerId);
    }

    public function broadcastAs()
    {
        return 'ChallengeRejected'; 
    }

    public function broadcastWith()
    {
        return [
            'challengerId'      => $this->challengerId,
            'opponentNickname'  => $this->opponentNickname,
        ];
    }

}
