<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CodeExecutorController;
use Illuminate\Support\Facades\DB;
use App\Models\Assignment;
use App\Http\Controllers\TaskController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::post('/execute-code', [CodeExecutorController::class, 'executeCode']);

Route::get('/first-task', function () {
    return response()->json(Assignment::first());
});

Route::get('/distinct-classes', [TaskController::class, 'getDistinctClasses']);

Route::get('/distinct-classes-informatics', [TaskController::class, 'getDistinctClassesInformatics']);