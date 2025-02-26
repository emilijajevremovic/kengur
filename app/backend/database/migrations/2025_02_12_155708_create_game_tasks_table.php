<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGameTasksTable extends Migration
{
    public function up()
    {
        Schema::create('game_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('game_id');
            $table->string('task_id'); 
            $table->integer('level')->nullable();
            $table->timestamps();

            $table->foreign('game_id')->references('game_id')->on('games')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_tasks');
    }
}
