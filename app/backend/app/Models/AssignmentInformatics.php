<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class AssignmentInformatics extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'assignment-informatics';

    protected $fillable = [
        'taskText', 
        'class', 
        'testCases', 
        'taskPicture'
    ];   

    public $timestamps = false;
}
