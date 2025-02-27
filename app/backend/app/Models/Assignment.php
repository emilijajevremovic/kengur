<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Jenssegers\Mongodb\Eloquent\Model;

class Assignment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'assignment';

    protected $fillable = [
        'taskText', 
        'class', 
        'level', 
        'taskPicture',
        'answersText',
        'answersPictures',
        'correctAnswerIndex',
        'correct',
        'wrong'
    ]; 

    public $timestamps = false;
}
