<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePasswordResetTable extends Migration
{
    public function up()
    {
        Schema::create('password_reset', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index(); // Email korisnika
            $table->string('token', 60); // Token za reset lozinke
            $table->timestamp('created_at')->nullable(); // Vreme kreiranja zapisa
        });
    }

    public function down() {
        Schema::dropIfExists('password_reset'); 
    }
}
