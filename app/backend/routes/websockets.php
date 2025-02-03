<?php

use BeyondCode\LaravelWebSockets\Facades\WebSocketRouter;

$onlineUsers = []; 

broadcastToAllUsers(["2", "3"]); // TESTNI POZIV

WebSocketRouter::webSocket('/app/{appKey}', function ($connection, $appKey) use (&$onlineUsers) {
    $connection->on('subscribe', function ($channelName) use (&$onlineUsers, $connection) {
        if (strpos($channelName, 'private-user-') === 0) {
            $userId = str_replace('private-user-', '', $channelName);
            $onlineUsers[$userId] = true; // Dodaj korisnika u listu
            broadcastToAllUsers(array_keys($onlineUsers)); // Emituj ažuriranu listu
        }
    });

    $connection->on('unsubscribe', function ($channelName) use (&$onlineUsers) {
        if (strpos($channelName, 'private-user-') === 0) {
            $userId = str_replace('private-user-', '', $channelName);
            unset($onlineUsers[$userId]); // Ukloni korisnika iz liste
            broadcastToAllUsers(array_keys($onlineUsers)); // Emituj ažuriranu listu
        }
    });
});

function broadcastToAllUsers($onlineUsers) {
    \Log::info("Emitovan OnlineUsersUpdated event", ['onlineUsers' => $onlineUsers]);
    broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers)); // emituj događaj o promenama
}
