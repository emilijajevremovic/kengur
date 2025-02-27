<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assignment;
use App\Models\AssignmentInformatics;

class TaskController extends Controller
{
    public function getDistinctClasses()
    {
        $classes = Assignment::distinct('class')->get()->map(function($cls) {
            return str_replace('--', '-', $cls); 
        })->unique()->values();
    
        return response()->json($classes);
    }

    public function getTasksByIds(Request $request)
    {
        $taskIds = $request->input('task_ids');

        $tasks = Assignment::whereIn('_id', $taskIds)->get();

        return response()->json($tasks);
    }

    public function getDistinctClassesInformatics()
    {
        $classes = AssignmentInformatics::distinct('class')->get()->map(function($cls) {
            return str_replace('--', '-', $cls);
        })->unique()->values();

        return response()->json($classes);
    }

    public function storeInformaticsTask(Request $request)
    {
        $data = $request->validate([
            'taskText' => 'required|string',
            'class' => 'required|string',
            'testCases' => 'required|string', 
            'taskPicture' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $testCasesArray = json_decode($data['testCases'], true);

        $taskPictureName = "";
        if ($request->hasFile('taskPicture')) {
            $file = $request->file('taskPicture');
            $classFolder = 'TaskImagesInformatics/' . $data['class'];
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path($classFolder), $filename);
            $taskPictureName = $filename;
        }

        $task = AssignmentInformatics::create([
            'taskText' => $data['taskText'],
            'taskPicture' => $taskPictureName,
            'testCases' => $testCasesArray, 
            'class' => $data['class'],
        ]);

        return response()->json(['message' => 'Task added successfully', 'task' => $task], 201);
    }

    public function storeMathTask(Request $request)
    {
        $data = $request->validate([
            'taskText' => 'nullable|string',
            'class' => 'required|string',
            'level' => 'required|integer|in:3,4,5',
            'answerType' => 'required|string|in:text,image',
            'correctAnswerIndex' => 'required|integer',
            'answersText' => 'nullable|array',
            'answersText.*' => 'required_if:answerType,text|string',
            'answersPictures' => 'nullable|array',
            'answersPictures.*' => 'required_if:answerType,image|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'taskPicture' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $data['correctAnswerIndex'] = (int) $data['correctAnswerIndex'];
        $data['level'] = (int) $data['level'];

        $taskPictureName = "";
        if ($request->hasFile('taskPicture')) {
            $file = $request->file('taskPicture');
            $folderPath = 'TaskImages/' . $data['class'] . '/' . $data['level'];
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path($folderPath), $filename);
            $taskPictureName = $filename;
        }

        $answersPictures = [];
        if ($data['answerType'] === 'image' && $request->hasFile('answersPictures')) {
            foreach ($request->file('answersPictures') as $index => $file) {
                $folderPath = 'TaskImages/' . $data['class'] . '/' . $data['level'];
                $filename = time() . '_answer_' . $index . '.' . $file->getClientOriginalExtension();
                $file->move(public_path($folderPath), $filename);
                $answersPictures[] = $filename;
            }
        }

        $task = Assignment::create([
            'taskText' => $data['taskText'] ?? "",
            'taskPicture' => $taskPictureName,
            'answersText' => $data['answerType'] === 'text' ? $data['answersText'] : [],
            'answersPictures' => $data['answerType'] === 'image' ? $answersPictures : [],
            'correctAnswerIndex' => $data['correctAnswerIndex'],
            'level' => $data['level'],
            'class' => $data['class'],
            'correct' => 0,
            'wrong' => 0,
        ]);

        return response()->json(['message' => 'Math task added successfully', 'task' => $task], 201);
    }





}
