<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGamesTable extends Migration
{
    public function up() {
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('game_id')->unique(); 
            $table->string('category'); 
            $table->string('class'); 
            $table->unsignedBigInteger('player_1'); 
            $table->unsignedBigInteger('player_2'); 
            $table->enum('status', ['active', 'finished', 'abandoned'])->default('active'); 
            $table->timestamps();

            $table->foreign('player_1')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('player_2')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down() {
        Schema::dropIfExists('games');
    }
    
}
