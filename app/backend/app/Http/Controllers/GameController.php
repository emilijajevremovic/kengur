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
use App\Models\AssignmentInformatics;
use App\Models\GameTask;
use Illuminate\Support\Facades\Log;
use App\Events\GameFinished;
use App\Models\GameResult;

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

        $gameId = uniqid();

        $game = Game::create([
            'game_id' => $gameId,
            'category' => $data['category'],
            'class' => $data['class'],
            'player_1' => $data['challenger_id'],
            'player_2' => $data['opponent_id'],
            'status' => 'active'
        ]);

        User::whereIn('id', [$data['challenger_id'], $data['opponent_id']])->update(['game' => true]);

        broadcast(new GameStarted(
            $game->game_id, 
            $game->category, 
            $game->class, 
            [$game->player_1, $game->player_2]
        ));

        $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray(); 
            
        broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));

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
            $tasksForLevel = Assignment::raw(function ($collection) use ($class, $level) {
                return $collection->aggregate([
                    ['$match' => ['class' => (string) $class, 'level' => $level]],
                    ['$sample' => ['size' => 3]] 
                ]);
            });

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

    public function assignInformaticsTaskToGame($gameId, $class)
    {
        $existingTask = GameTask::where('game_id', $gameId)->exists();

        if ($existingTask) {
            return response()->json(['message' => 'Task already assigned for this game']);
        }

        $task = AssignmentInformatics::raw(function ($collection) use ($class) {
            return $collection->aggregate([
                ['$match' => ['class' => (string) $class]],
                ['$sample' => ['size' => 1]] 
            ]);
        })->first();

        if (!$task) {
            return response()->json(['message' => 'No available tasks'], 404);
        }

        GameTask::create([
            'game_id' => $gameId,
            'task_id' => $task->_id,
            'level' => null,
        ]);

        return response()->json(['message' => 'Informatics task assigned successfully']);
    }



    public function getGameTasks($gameId)
    {
        $tasks = GameTask::where('game_id', $gameId)->get();

        $taskDetails = Assignment::whereIn('_id', $tasks->pluck('task_id'))->get();

        $sortedTasks = $taskDetails->sortBy('level')->values();

        return response()->json($sortedTasks);
    }

    public function getInformaticsGameTask($gameId)
    {
        $gameTask = GameTask::where('game_id', $gameId)->first();

        if (!$gameTask) {
            return response()->json(['message' => 'No task assigned'], 404);
        }

        $task = AssignmentInformatics::where('_id', $gameTask->task_id)->first();

        return response()->json($task);
    }

    public function checkAnswers(Request $request, $gameId)
    {
        $data = $request->validate([
            'answers' => 'array',
            'answers.*.taskId' => 'string',
            'answers.*.selectedIndex' => 'integer',
        ]);

        $correctAnswers = 0;
        $totalQuestions = 9;

        if (!empty($data['answers'])) {
            foreach ($data['answers'] as $answer) {
                $task = Assignment::find($answer['taskId']);
    
                if ($task && $task->correctAnswerIndex == $answer['selectedIndex']) {
                    $correctAnswers++;
                }
            }
        }

        return response()->json([
            'message' => 'Quiz finished',
            'correctAnswers' => $correctAnswers,
            'totalQuestions' => $totalQuestions
        ]);
    }

    public function checkInformaticsAnswers(Request $request, $gameId)
    {
        $gameTask = GameTask::where('game_id', $gameId)->first();

        if (!$gameTask) {
            return response()->json(['error' => 'Game task not found'], 404);
        }

        $task = AssignmentInformatics::find($gameTask->task_id);

        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $userCode = $request->input('code');
        $language = $request->input('language');

        $correctAnswers = 0;
        $totalQuestions = count($task->testCases);
        $errors = [];

        foreach ($task->testCases as $testCase) {
            $input = $testCase['input'];
            $expectedOutput = trim($testCase['output']);

            $executionResult = $this->executeUserCode($userCode, $input, $language);

            if ($executionResult['error']) {
                return response()->json(['error' => $executionResult['error']], 400);
            }

            $userOutput = trim($executionResult['output']);

            if ($userOutput === $expectedOutput) {
                $correctAnswers++;
            } else {
                $errors[] = [
                    'input' => $input,
                    'expected' => $expectedOutput,
                    'got' => $userOutput
                ];
            }
        }

        return response()->json([
            'correctAnswers' => $correctAnswers,
            'totalQuestions' => $totalQuestions,
            'errors' => $errors
        ]);
    }


    public function submitGameResult(Request $request, $gameId)
    {
        $data = $request->validate([
            'correctAnswers' => 'required|integer',
            'duration' => 'required|string'
        ]);

        $userId = Auth::id();

        $gameResult = GameResult::updateOrCreate(
            ['game_id' => $gameId, 'user_id' => $userId],
            ['correct_answers' => $data['correctAnswers'], 'duration' => $data['duration']]
        );

        return $this->deleteGameInfo($gameId);
    }

    public function getGameResults($gameId)
    {
        $results = GameResult::where('game_id', $gameId)->get();
        return response()->json($results);
    }

    public function finishGame(Request $request, $gameId)
    {
        $userId = Auth::id();
        
        $data = $request->validate([
            'correctAnswers' => 'required|integer',
            'totalQuestions' => 'required|integer',
            'timeTaken' => 'required|string',
        ]);

        $game = Game::where('game_id', $gameId)->first();

        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        GameResult::updateOrCreate(
            ['game_id' => $gameId, 'user_id' => $userId],
            ['correct_answers' => $data['correctAnswers'], 'duration' => $data['timeTaken']]
        );

        $user = User::find($userId);
        if ($user) {
            $user->update(['online' => true, 'game' => false]);

            $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray(); 
            
            broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));
        }
    
        $results = GameResult::where('game_id', $gameId)->get();
        
        if ($results->count() === 2) {
            $player1 = $results->where('user_id', $game->player_1)->first();
            $player2 = $results->where('user_id', $game->player_2)->first();

            $player1Data = User::find($game->player_1);
            $player2Data = User::find($game->player_2);

            if($game->category == 'info') {
                $gameTask = GameTask::where('game_id', $gameId)->first();
                $task = $gameTask ? AssignmentInformatics::find($gameTask->task_id) : null;

                $totalQuestions = $task ? count($task->testCases) : 0;
                $gameData = [
                    'gameId' => $gameId,
                    'category' => $game->category,
                    'player1' => [
                        'id' => $player1->user_id,
                        'correctAnswers' => $player1->correct_answers,
                        'totalQuestions' => $totalQuestions,
                        'timeTaken' => $player1->duration,
                        'profilePicture' => $player1Data ? $player1Data->profile_picture : null, 
                        'nickname' => $player1Data ? $player1Data->nickname : 'Nepoznat korisnik'
                    ],
                    'player2' => [
                        'id' => $player2->user_id,
                        'correctAnswers' => $player2->correct_answers,
                        'totalQuestions' => $totalQuestions,
                        'timeTaken' => $player2->duration,
                        'profilePicture' => $player2Data ? $player2Data->profile_picture : null, 
                        'nickname' => $player2Data ? $player2Data->nickname : 'Nepoznat korisnik'
                    ]
                ];
            }
            else {
                $gameData = [
                    'gameId' => $gameId,
                    'category' => $game->category,
                    'player1' => [
                        'id' => $player1->user_id,
                        'correctAnswers' => $player1->correct_answers,
                        'totalQuestions' => $player1->total_questions,
                        'timeTaken' => $player1->duration,
                        'profilePicture' => $player1Data ? $player1Data->profile_picture : null, 
                        'nickname' => $player1Data ? $player1Data->nickname : 'Nepoznat korisnik'
                    ],
                    'player2' => [
                        'id' => $player2->user_id,
                        'correctAnswers' => $player2->correct_answers,
                        'totalQuestions' => $player2->total_questions,
                        'timeTaken' => $player2->duration,
                        'profilePicture' => $player2Data ? $player2Data->profile_picture : null, 
                        'nickname' => $player2Data ? $player2Data->nickname : 'Nepoznat korisnik'
                    ]
                ];
            }
    
            broadcast(new GameFinished($gameData));
            $this->deleteGameInfo($gameId);
        }

        return response()->json(['message' => 'Game results sent']);
    }

    public function deleteGameInfo($gameId)
    {
        $playersFinished = GameResult::where('game_id', $gameId)->count();

        if ($playersFinished >= 2) { 
            GameTask::where('game_id', $gameId)->delete();
            Game::where('game_id', $gameId)->delete();
            
            return response()->json(['message' => 'Game deleted successfully']);
        }

        return response()->json(['message' => 'Waiting for the second player']);
    }

    public function forfeitGame($gameId)
    {
        $userId = Auth::id();

        $existingResult = GameResult::where('game_id', $gameId)->where('user_id', $userId)->first();

        if ($existingResult) {
            return response()->json(['message' => 'Player already finished or forfeited'], 200);
        }

        GameResult::create([
            'game_id' => $gameId,
            'user_id' => $userId,
            'correct_answers' => 0,
            'duration' => '-1'
        ]);

        $game = Game::where('game_id', $gameId)->first();
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        $results = GameResult::where('game_id', $gameId)->get();

        $user = User::find($userId);
        if ($user) {
            $user->update(['online' => true, 'game' => false]);

            $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray(); 
            
            broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));
        }

        if ($results->count() === 2) {
            $player1 = $results->where('user_id', $game->player_1)->first();
            $player2 = $results->where('user_id', $game->player_2)->first();

            $player1Data = User::find($game->player_1);
            $player2Data = User::find($game->player_2);

            $totalQuestions = $game->category === 'info' ? 3 : 9;

            $gameData = [
                'gameId' => $gameId,
                'category' => $game->category,
                'player1' => [
                    'id' => $player1->user_id,
                    'correctAnswers' => $player1->correct_answers,
                    'totalQuestions' => $totalQuestions,
                    'timeTaken' => $player1->duration,
                    'profilePicture' => $player1Data ? $player1Data->profile_picture : null,
                    'nickname' => $player1Data ? $player1Data->nickname : 'Nepoznat korisnik'
                ],
                'player2' => [
                    'id' => $player2->user_id,
                    'correctAnswers' => $player2->correct_answers,
                    'totalQuestions' => $totalQuestions,
                    'timeTaken' => $player2->duration,
                    'profilePicture' => $player2Data ? $player2Data->profile_picture : null,
                    'nickname' => $player2Data ? $player2Data->nickname : 'Nepoznat korisnik'
                ]
            ];

            broadcast(new GameFinished($gameData));
            $this->deleteGameInfo($gameId);
        }

        return response()->json(['message' => 'Player forfeited']);
    }

}