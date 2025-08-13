<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str; 
use Illuminate\Support\Facades\File;
use App\Http\Controllers\Controller;
use App\Models\AssignmentInformatics;
use App\Models\GameTask;
use App\Models\GameResult;
use App\Models\User;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class CodeExecutorController extends Controller
{
    public function executeCode(Request $request)
    {
        $code = $request->input('code');
        $input = $request->input('input', '');
        $language = $request->input('language');

        $error = '';
        $output = '';

        $uniqueId = Str::uuid(); 
        $userDir = storage_path("code_execution/$uniqueId");

        if (!file_exists($userDir)) {
            mkdir($userDir, 0777, true);
        }

        $sourceFile = "$userDir/code";
        $inputFile = "$userDir/input.txt";
        $outputExe = "$userDir/output.exe";

        switch ($language) {
            case 'c':
                $sourceFile .= '.c';
                file_put_contents($sourceFile, $code);

                $compileCommand = "C:\\MinGW\\bin\\gcc.exe " . escapeshellarg($sourceFile) . " -o " . escapeshellarg($outputExe) . " 2>&1";
                $compileOutput = shell_exec($compileCommand);

                if (!file_exists($outputExe)) {
                    File::deleteDirectory($userDir);
                    return response()->json(["error" => "Compilation failed: $compileOutput"], 400);
                }

                if (!empty($input)) {
                    file_put_contents($inputFile, $input);
                    $executionCommand = escapeshellarg($outputExe) . " < " . escapeshellarg($inputFile) . " 2>&1";
                    $output = shell_exec($executionCommand);
                } else {
                    $executionCommand = escapeshellarg($outputExe) . " 2>&1";
                    $output = shell_exec($executionCommand);
                }
                break;

            case 'cpp':
                $sourceFile .= '.cpp';
                file_put_contents($sourceFile, $code);

                $compileCommand = "C:\\MinGW\\bin\\g++.exe " . escapeshellarg($sourceFile) . " -o " . escapeshellarg($outputExe) . " 2>&1";
                $compileOutput = shell_exec($compileCommand);

                if (!file_exists($outputExe)) {
                    File::deleteDirectory($userDir);
                    return response()->json(["error" => "Compilation failed: $compileOutput"], 400);
                }

                if (!empty($input)) {
                    file_put_contents($inputFile, $input);
                    $executionCommand = escapeshellarg($outputExe) . " < " . escapeshellarg($inputFile) . " 2>&1";
                    $output = shell_exec($executionCommand);
                } else {
                    $executionCommand = escapeshellarg($outputExe) . " 2>&1";
                    $output = shell_exec($executionCommand);
                }
                break;

            case 'python':
                $sourceFile .= '.py';
                file_put_contents($sourceFile, $code);
                file_put_contents($inputFile, $input);

                $pythonPath = "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";
                $pythonCommand = escapeshellarg($pythonPath) . " " . escapeshellarg($sourceFile) . " < " . escapeshellarg($inputFile) . " 2>&1";
                exec($pythonCommand, $outputArr, $return_var);

                $output = is_array($outputArr) ? implode("\n", $outputArr) : $outputArr;
                break;

            default:
                File::deleteDirectory($userDir);
                return response()->json(["error" => "Unsupported language"], 400);
        }

        if (is_array($output)) {
            $output = implode("\n", $output);
        }

        File::deleteDirectory($userDir);

        return response()->json(["output" => $output]);
    }

    public function checkInformaticsAnswers2(Request $request, $gameId)
    {
        $userId = Auth::id();
        $data = $request->validate([
            'code' => 'required|string',
            'language' => 'required|string',
            'duration' => 'required|string'
        ]);

        $gameTask = GameTask::where('game_id', $gameId)->first();
        if (!$gameTask) {
            return response()->json(['error' => 'No task assigned to this game'], 404);
        }

        $task = AssignmentInformatics::find($gameTask->task_id);
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $code = $data['code'];
        $language = $data['language'];
        $duration = $data['duration'];

        $correctAnswers = 0;
        $totalQuestions = count($task->testCases);

        $uniqueId = Str::uuid();
        $userDir = storage_path("code_execution/$uniqueId");

        if (!file_exists($userDir)) {
            mkdir($userDir, 0777, true);
        }

        $sourceFile = "$userDir/code";
        $inputFile = "$userDir/input.txt";
        $outputExe = "$userDir/output.exe";

        switch ($language) {
            case 'c':
                $sourceFile .= '.c';
                file_put_contents($sourceFile, $code);
                $compileCommand = "C:\\MinGW\\bin\\gcc.exe $sourceFile -o $outputExe 2>&1";
                $compileOutput = shell_exec($compileCommand);
                if (!file_exists($outputExe)) {
                    File::deleteDirectory($userDir);
                    return response()->json(["error" => "Compilation failed: $compileOutput"], 400);
                }
                break;

            case 'cpp':
                $sourceFile .= '.cpp';
                file_put_contents($sourceFile, $code);
                $compileCommand = "C:\\MinGW\\bin\\g++.exe $sourceFile -o $outputExe 2>&1";
                $compileOutput = shell_exec($compileCommand);
                if (!file_exists($outputExe)) {
                    File::deleteDirectory($userDir);
                    return response()->json(["error" => "Compilation failed: $compileOutput"], 400);
                }
                break;

            case 'python':
                $sourceFile .= '.py';
                file_put_contents($sourceFile, $code);
                break;

            default:
                File::deleteDirectory($userDir);
                return response()->json(["error" => "Unsupported language"], 400);
        }

        foreach ($task->testCases as $testCase) {
            file_put_contents($inputFile, $testCase['input']);
            
            $executionOutput = '';
            
            switch ($language) {
                case 'c':
                case 'cpp':
                    $executionCommand = "$outputExe < $inputFile 2>&1";
                    $executionOutput = shell_exec($executionCommand);
                    break;
                case 'python':
                    $pythonPath = "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";
                    $executionCommand = "$pythonPath $sourceFile < $inputFile 2>&1";
                    $executionOutput = shell_exec($executionCommand);
                    break;
            }

            $executionOutput = str_replace(["\r\n", "\r"], "\n", trim($executionOutput));
            $expectedOutput = str_replace(["\r\n", "\r"], "\n", trim($testCase['output']));

            if (trim($executionOutput) === trim($testCase['output'])) {
                $correctAnswers++;
            }
        }

        File::deleteDirectory($userDir);

        GameResult::updateOrCreate(
            ['game_id' => $gameId, 'user_id' => $userId],
            ['correct_answers' => $correctAnswers, 'duration' => $duration]
        );

        return response()->json([
            'message' => 'Game results submitted',
            'correctAnswers' => $correctAnswers,
            'totalQuestions' => $totalQuestions
        ]);
    }

    public function checkInformaticsAnswers(Request $request, $gameId)
    {
        $userId = Auth::id();
        $data = $request->validate([
            'code' => 'required|string',
            'language' => 'required|string',
            'duration' => 'required|string'
        ]);

        $gameTask = GameTask::where('game_id', $gameId)->first();
        if (!$gameTask) {
            return response()->json(['error' => 'No task assigned to this game'], 404);
        }

        $task = AssignmentInformatics::find($gameTask->task_id);
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $code = $data['code'];
        $language = strtolower($data['language']);
        $duration = $data['duration'];

        $correctAnswers = 0;
        $totalQuestions = count($task->testCases);

        // Unikatni folder za ovog korisnika/instancu igre
        $uniqueId = Str::uuid();
        $userDir = storage_path("code_execution/$uniqueId");

        if (!file_exists($userDir)) {
            mkdir($userDir, 0777, true);
        }

        $sourceFile = "$userDir/code";
        $inputFile = "$userDir/input.txt";
        $outputExe = "$userDir/output"; // bez ekstenzije .exe na Linuxu

        // --- Kompajliranje / priprema ---
        switch ($language) {
            case 'c':
                $sourceFile .= '.c';
                file_put_contents($sourceFile, $code);
                $compileCommand = "gcc -o $outputExe $sourceFile -lm 2>&1";
                $compileOutput = shell_exec($compileCommand);
                if (!file_exists($outputExe)) {
                    File::deleteDirectory($userDir);
                    return response()->json(["error" => "Compilation failed: $compileOutput"], 400);
                }
                break;

            case 'cpp':
                $sourceFile .= '.cpp';
                file_put_contents($sourceFile, $code);
                $compileCommand = "g++ -o $outputExe $sourceFile 2>&1";
                $compileOutput = shell_exec($compileCommand);
                if (!file_exists($outputExe)) {
                    File::deleteDirectory($userDir);
                    return response()->json(["error" => "Compilation failed: $compileOutput"], 400);
                }
                break;

            case 'python':
                $sourceFile .= '.py';
                file_put_contents($sourceFile, $code);
                break;

            default:
                File::deleteDirectory($userDir);
                return response()->json(["error" => "Unsupported language"], 400);
        }

        // --- Izvršavanje po test slučajevima ---
        foreach ($task->testCases as $index => $testCase) {
            file_put_contents($inputFile, $testCase['input']);

            $executionOutput = '';

            switch ($language) {
                case 'c':
                case 'cpp':
                    // timeout 15 sekundi
                    $executionCommand = "timeout 15 $outputExe < $inputFile 2>&1";
                    $executionOutput = shell_exec($executionCommand);
                    break;

                case 'python':
                    $executionCommand = "timeout 15 python3 $sourceFile < $inputFile 2>&1";
                    $executionOutput = shell_exec($executionCommand);
                    break;
            }

            // Normalizacija izlaza
            $executionOutput = str_replace(["\r\n", "\r"], "\n", trim($executionOutput));
            $expectedOutput = str_replace(["\r\n", "\r"], "\n", trim($testCase['output']));

            if ($executionOutput === $expectedOutput) {
                $correctAnswers++;
            }
        }

        // Čišćenje direktorijuma
        File::deleteDirectory($userDir);

        GameResult::updateOrCreate(
            ['game_id' => $gameId, 'user_id' => $userId],
            ['correct_answers' => $correctAnswers, 'duration' => $duration]
        );

        return response()->json([
            'message' => 'Game results submitted',
            'correctAnswers' => $correctAnswers,
            'totalQuestions' => $totalQuestions
        ]);
    }

    public function testCheckInformatics(Request $request)
    {
        $gameId = $request->input('game_id', 1);

        return $this->checkInformaticsAnswers($request, $gameId);
    }

    public function testCodeRun(Request $request)
    {
        $data = $request->validate([
            'code'     => 'required|string',
            'language' => 'required|string',   // 'c' | 'cpp' | 'python'
            'input'    => 'nullable|string',   // može biti prazan string
            'timeout'  => 'nullable|integer',  // u sekundama, opcionalno
        ]);

        $code     = $data['code'];
        $language = strtolower($data['language']);
        $input    = $data['input'] ?? '';
        $timeout  = max(1, (int)($data['timeout'] ?? 15));

        // Jedinstveni privremeni direktorijum (nema kolizije); brišemo na kraju
        $uniqueId = \Illuminate\Support\Str::uuid();
        $userDir  = storage_path("code_execution/{$uniqueId}");
        if (!is_dir($userDir)) {
            mkdir($userDir, 0777, true);
        }

        $sourceFile = "{$userDir}/code";
        $inputFile  = "{$userDir}/input.txt";
        $binFile    = "{$userDir}/outbin"; // bez .exe na Linuxu

        // Upis ulaza (lakše i bez citiranja specijalnih znakova)
        file_put_contents($inputFile, $input);

        $compileOutput = '';
        $runCmd = null;

        switch ($language) {
            case 'c':
                $sourceFile .= '.c';
                file_put_contents($sourceFile, $code);
                $compileCmd   = 'gcc ' . escapeshellarg($sourceFile) . ' -o ' . escapeshellarg($binFile) . ' -lm 2>&1';
                $compileOutput = shell_exec($compileCmd);
                if (!file_exists($binFile)) {
                    \Illuminate\Support\Facades\File::deleteDirectory($userDir);
                    return response()->json(['error' => "Compilation failed", 'details' => $compileOutput], 400);
                }
                $runCmd = "timeout {$timeout} " . escapeshellarg($binFile) . " < " . escapeshellarg($inputFile) . " 2>&1";
                break;

            case 'cpp':
                $sourceFile .= '.cpp';
                file_put_contents($sourceFile, $code);
                $compileCmd   = 'g++ ' . escapeshellarg($sourceFile) . ' -o ' . escapeshellarg($binFile) . ' 2>&1';
                $compileOutput = shell_exec($compileCmd);
                if (!file_exists($binFile)) {
                    \Illuminate\Support\Facades\File::deleteDirectory($userDir);
                    return response()->json(['error' => "Compilation failed", 'details' => $compileOutput], 400);
                }
                $runCmd = "timeout {$timeout} " . escapeshellarg($binFile) . " < " . escapeshellarg($inputFile) . " 2>&1";
                break;

            case 'python':
                $sourceFile .= '.py';
                file_put_contents($sourceFile, $code);
                $runCmd = "timeout {$timeout} python3 " . escapeshellarg($sourceFile) . " < " . escapeshellarg($inputFile) . " 2>&1";
                break;

            default:
                \Illuminate\Support\Facades\File::deleteDirectory($userDir);
                return response()->json(['error' => 'Unsupported language'], 400);
        }

        $output = shell_exec($runCmd) ?? '';
        // Normalizuj nove redove
        $output = str_replace(["\r\n", "\r"], "\n", trim($output));

        // Čišćenje privremenih fajlova/dir-a
        \Illuminate\Support\Facades\File::deleteDirectory($userDir);

        return response()->json([
            'message' => 'Executed',
            'output'  => $output,
        ]);
    }



}
