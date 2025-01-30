<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFriendRequestsTable extends Migration
{
    public function up()
    {
        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade'); // Korisnik koji šalje zahtev
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade'); // Korisnik koji prima zahtev
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending'); // Status zahteva
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('friend_requests');
    }
}
