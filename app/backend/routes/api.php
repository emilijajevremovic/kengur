<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\GameController;
use App\Events\WebSocketDisconnected;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/create-user', [UserController::class, 'create']);

Route::get('user/{id}', [UserController::class, 'getUserById']);

Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:api')->get('search-users', [UserController::class, 'searchUsers']);

Route::middleware('auth:sanctum')->get('/user', [UserController::class, 'getUser']);

Route::middleware('auth:sanctum')->post('/update-user', [UserController::class, 'updateUserProfile']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/send-friend-request', [FriendRequestController::class, 'sendRequest']);
    Route::post('/accept-friend-request', [FriendRequestController::class, 'acceptRequest']);
    Route::post('/reject-friend-request', [FriendRequestController::class, 'rejectRequest']);
});

Route::middleware('auth:sanctum')->get('/friend-requests', [FriendRequestController::class, 'getFriendRequests']);

Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);

Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->get('/users', [UserController::class, 'getUsers']);

Route::middleware('auth:sanctum')->post('/set-online', [UserController::class, 'setOnline']);

// Route::middleware('auth:sanctum')->post('/set-offline', [UserController::class, 'setOffline']);
Route::post('/set-offline', [UserController::class, 'setOffline']);

Route::middleware('auth:api')->get('/online-users', [UserController::class, 'getOnlineUsers']);

Route::middleware('auth:sanctum')->get('/user-id', [UserController::class, 'getUserId']);

Route::middleware('auth:sanctum')->post('/send-challenge', [GameController::class, 'sendChallenge']);

Route::middleware('auth:sanctum')->post('/reject-challenge', [GameController::class, 'rejectChallenge']);

Route::middleware('auth:sanctum')->post('/accept-challenge', [GameController::class, 'acceptChallenge']);


Route::post('/test-disconnect', function (Request $request) {
    $userId = $request->input('user_id');
    $gameId = $request->input('game_id');

    broadcast(new WebSocketDisconnected($userId, $gameId));

    return response()->json(['message' => 'WebSocketDisconnected event emitted']);
});

Route::middleware(['auth:sanctum', 'game.participant'])->get('/game/{gameId}', [GameController::class, 'getGameData']);

