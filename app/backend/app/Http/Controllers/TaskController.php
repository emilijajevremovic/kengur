<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Assignment;

class TaskController extends Controller
{
    public function getDistinctClasses()
    {
        $classes = Assignment::distinct('class')->get()->map(function($cls) {
            return str_replace('--', '-', $cls); 
        })->unique()->values();
    
        return response()->json($classes);
    }
}
