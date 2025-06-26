<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GameFinished implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $gameId;
    public $category;
    public $player1;
    public $player2;

    public function __construct($gameData)
    {
        $this->gameId = $gameData['gameId'];
        $this->category = $gameData['category'];
        $this->player1 = $gameData['player1'];
        $this->player2 = $gameData['player2'];
    }

    public function broadcastOn()
    {
        return new Channel("game-results.{$this->gameId}");
    }

    public function broadcastAs()
    {
        return 'GameFinished';
    }

    public function broadcastWith()
    {
        return [
            'gameId' => $this->gameId,
            'category' => $this->category,
            'player1' => $this->player1,
            'player2' => $this->player2,
        ];
    }

}
