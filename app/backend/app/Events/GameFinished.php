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
    public $userId;
    public $correctAnswers;
    public $totalQuestions;

    public function __construct($gameId, $userId, $correctAnswers, $totalQuestions)
    {
        $this->gameId = $gameId;
        $this->userId = $userId;
        $this->correctAnswers = $correctAnswers;
        $this->totalQuestions = $totalQuestions;
    }

    public function broadcastOn()
    {
        return new Channel("game-results.{$this->gameId}");
    }

    public function broadcastAs()
    {
        return 'GameFinished';
    }
}
