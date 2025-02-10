<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GameStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $gameId;
    public $category;
    public $class;
    public $players;

    public function __construct($gameId, $category, $class, $players)
    {
        $this->gameId = $gameId;
        $this->category = $category;
        $this->class = $class;
        $this->players = $players;
    }

    public function broadcastOn()
    {
        //Log::info("📡 Emitovanje GameStarted eventa za igrače: " . implode(', ', $this->players));
        return [
            new Channel('user.' . $this->players[0]), 
            new Channel('user.' . $this->players[1])
        ];
    }

    public function broadcastAs()
    {
        return 'GameStarted';
    }
}
