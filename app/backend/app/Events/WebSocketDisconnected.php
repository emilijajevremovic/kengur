<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class WebSocketDisconnected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $gameId;

    public function __construct($userId, $gameId)
    {
        $this->userId = $userId;
        $this->gameId = $gameId;
    }

    public function broadcastOn()
    {
        //Log::info("Emitovanje WebSocketDisconnected za user.{$this->userId}, game: {$this->gameId}");
        return new Channel('game.' . $this->gameId);
    }

    public function broadcastAs()
    {
        return 'PlayerDisconnected';
    }
}
