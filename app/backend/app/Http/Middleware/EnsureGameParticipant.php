<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;

class EnsureGameParticipant
{
    public function handle(Request $request, Closure $next)
    {
        $gameId = $request->route('gameId'); 
        $userId = Auth::id();  

        $game = Game::where('game_id', $gameId)
            ->where(function ($query) use ($userId) {
                $query->where('player_1', $userId)
                      ->orWhere('player_2', $userId);
            })->first();

        if (!$game) {
            return response()->json(['error' => 'Unauthorized access to game'], 403);
        }

        return $next($request);
    }
}
