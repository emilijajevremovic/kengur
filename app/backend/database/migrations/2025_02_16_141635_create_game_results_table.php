<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGameResultsTable extends Migration
{
    public function up()
    {
        Schema::create('game_results', function (Blueprint $table) {
            $table->id();
            $table->string('game_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('correct_answers');
            $table->string('duration');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('game_results');
    }
}
