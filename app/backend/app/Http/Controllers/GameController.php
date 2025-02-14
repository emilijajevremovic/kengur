<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Game;
use App\Events\ChallengeUser;
use App\Events\GameStarted;
use App\Events\ChallengeRejected;
use App\Models\Assignment;
use App\Models\GameTask;
use Illuminate\Support\Facades\Log;

class GameController extends Controller 
{
    public function sendChallenge(Request $request)
    {
        $data = $request->validate([
            'challenger_name' => 'required|string',
            'opponent_id' => 'required|integer',
            'category' => 'required|string',
            'class' => 'required|string',
        ]);

        $challenger = auth()->user();
        if (!$challenger) {
            return response()->json(['error' => 'Challenger not found'], 404);
        }

        broadcast(new ChallengeUser(
            $data['challenger_name'], 
            $challenger->id, 
            $data['opponent_id'],
            $data['category'], 
            $data['class'],
            $challenger->profile_picture 
        ))->toOthers();

        return response()->json([
            'message' => 'Challenge sent successfully!',
            'challenger_name' => $data['challenger_name'],
            'challenger_id' => $challenger->id,
            'opponent_id' => $data['opponent_id'],
            'category' => $data['category'],
            'class' => $data['class'],
            'profile_picture' => $challenger->profile_picture
        ]);
    }

    public function rejectChallenge(Request $request)
    {
        $data = $request->validate([
            'challenger_id' => 'required|integer',
            'opponent_nickname' => 'required|string',
        ]);

        broadcast(new ChallengeRejected($data['challenger_id'], $data['opponent_nickname']));

        return response()->json(['message' => 'Challenge rejected']);
    }

    public function acceptChallenge(Request $request)
    {
        $data = $request->validate([
            'challenger_id' => 'required|integer',
            'opponent_id' => 'required|integer',
            'category' => 'required|string',
            'class' => 'required|string',
        ]);

        // Generišemo jedinstveni game_id
        $gameId = uniqid();

        // Kreiramo igru i čuvamo je u bazi
        $game = Game::create([
            'game_id' => $gameId,
            'category' => $data['category'],
            'class' => $data['class'],
            'player_1' => $data['challenger_id'],
            'player_2' => $data['opponent_id'],
            'status' => 'active'
        ]);

        broadcast(new GameStarted(
            $game->game_id, 
            $game->category, 
            $game->class, 
            [$game->player_1, $game->player_2]
        ));

        return response()->json(['message' => 'Game started', 'gameId' => $game->game_id]);
    }

    public function getGameData($gameId)
    {
        $userId = Auth::id();

        $game = Game::where('game_id', $gameId)
            ->where(function ($query) use ($userId) {
                $query->where('player_1', $userId)
                      ->orWhere('player_2', $userId);
            })->first();

        if (!$game) {
            return response()->json(['error' => 'Unauthorized access to game'], 403);
        }

        return response()->json([
            'gameId' => $game->game_id,
            'category' => $game->category,
            'class' => $game->class,
            'players' => [$game->player_1, $game->player_2]
        ]);
    }

    public function assignTasksToGame($gameId, $class)
    {
        $existingTasks = GameTask::where('game_id', $gameId)->exists();

        if ($existingTasks) {
            return response()->json(['message' => 'Tasks already assigned for this game']);
        }
        
        $tasks = collect();

        foreach ([3, 4, 5] as $level) {
            $tasksForLevel = Assignment::where('class', (string) $class)
                ->where('level', $level)
                ->limit(3)
                ->get();

            $tasks = $tasks->merge($tasksForLevel);
        }

        foreach ($tasks as $task) {
            GameTask::create([
                'game_id' => $gameId,
                'task_id' => $task->_id, 
                'level' => $task->level,
            ]);
        }

        return response()->json(['message' => 'Tasks assigned successfully']);
    }

    public function getGameTasks($gameId)
    {
        $tasks = GameTask::where('game_id', $gameId)->get();

        $taskDetails = Assignment::whereIn('_id', $tasks->pluck('task_id'))->get();

        return response()->json($taskDetails);
    }

    public function checkAnswers(Request $request)
    {
        $data = $request->validate([
            'answers' => 'required|array',
            'answers.*.taskId' => 'required|string',
            'answers.*.selectedIndex' => 'required|integer',
        ]);

        $correctAnswers = 0;
        $totalQuestions = 9;

        foreach ($data['answers'] as $answer) {
            $task = Assignment::find($answer['taskId']);

            if ($task && $task->correctAnswerIndex == $answer['selectedIndex']) {
                $correctAnswers++;
            }
        }

        return response()->json([
            'message' => 'Quiz finished',
            'correctAnswers' => $correctAnswers,
            'totalQuestions' => $totalQuestions
        ]);
    }


}