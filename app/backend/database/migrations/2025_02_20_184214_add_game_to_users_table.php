<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddGameToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('game')->default(false)->after('online');
        });
    }   

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('game');
        });
    }

}
