<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameTask extends Model
{
    use HasFactory;

    protected $table = 'game_tasks';

    protected $fillable = ['game_id', 'task_id', 'level'];

    public $timestamps = true;
    
}
