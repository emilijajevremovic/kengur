<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id', 'category', 'class', 'player_1', 'player_2', 'status'
    ];

    public function playerOne() {
        return $this->belongsTo(User::class, 'player_1');
    }

    public function playerTwo() {
        return $this->belongsTo(User::class, 'player_2');
    }
}
