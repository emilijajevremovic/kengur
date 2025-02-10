<?php

use Illuminate\Support\Facades\Broadcast;
use App\Events\WebSocketDisconnected;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('game.{gameId}', function ($user, $gameId) {
    return true;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id; 
});

Broadcast::on('pusher:member_removed', function ($event) {
    //Log::info("pusher:member_removed triggered", ['event' => $event]);
    if (isset($event['channel']) && strpos($event['channel'], 'game.') === 0) {
        $gameId = str_replace('game.', '', $event['channel']);
        broadcast(new WebSocketDisconnected($event['user_id'], $gameId));
    }
});
