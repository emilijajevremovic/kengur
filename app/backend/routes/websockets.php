<?php

use BeyondCode\LaravelWebSockets\Facades\WebSocketRouter;
use Illuminate\Support\Facades\Log;
use App\Models\User;

WebSocketRouter::webSocket('/app/{appKey}', function ($connection, $appKey) {

    $connection->on('subscribe', function ($channelName) use ($connection) {

        if (strpos($channelName, 'private-user-') === 0) {
            $userId = str_replace('private-user-', '', $channelName);

            // Dohvati listu online korisnika iz cache-a
            //$onlineUsers = Cache::get('online_users', []);
            User::where('id', $userId)->update(['online' => true]);

            $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray();

            broadcastToAllUsers($onlineUsers);

            // Dodaj korisnika ako ga nema
            // if (!in_array($userId, $onlineUsers)) {
            //     $onlineUsers[] = $userId;
            //     Cache::put('online_users', $onlineUsers, now()->addMinutes(30)); // Čuvamo online status 30 min
            // }

            // broadcastToAllUsers($onlineUsers); // Emituj ažuriranu listu
        }
    });

    $connection->on('unsubscribe', function ($channelName) {
        if (strpos($channelName, 'private-user-') === 0) {
            $userId = str_replace('private-user-', '', $channelName);

            // Dohvati trenutnu listu online korisnika
            //$onlineUsers = Cache::get('online_users', []);
            User::where('id', $userId)->update(['online' => false]);

            $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray();

            broadcastToAllUsers($onlineUsers);

            // Ukloni korisnika ako postoji
            // $onlineUsers = array_diff($onlineUsers, [$userId]);

            // Cache::put('online_users', $onlineUsers, now()->addMinutes(30));

            // broadcastToAllUsers($onlineUsers); // Emituj ažuriranu listu
        }
    });
});

function broadcastToAllUsers($onlineUsers) {
    broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers)); // Emituj događaj
}
