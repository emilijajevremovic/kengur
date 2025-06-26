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
    public $challengerId;
    public $category;
    public $class;
    public $opponentId;
    public $profilePicture;

    public function __construct($challengerName, $challengerId, $opponentId, $category, $class, $profilePicture)
    {
        $this->challengerName = $challengerName;
        $this->challengerId = $challengerId;
        $this->category = $category;
        $this->class = $class;
        $this->opponentId = $opponentId; 
        $this->profilePicture = $profilePicture;
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

    public function broadcastWith()
    {
        return [
            'challengerName'   => $this->challengerName,
            'challengerId'     => $this->challengerId,
            'category'         => $this->category,
            'class'            => $this->class,
            'opponentId'       => $this->opponentId,
            'profilePicture'   => $this->profilePicture,
        ];
    }

}
