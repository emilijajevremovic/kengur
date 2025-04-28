<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddClassAndGradesToUsersTable extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('class')->default(1)->after('losses');
            $table->unsignedTinyInteger('math_grade')->default(1)->after('class');
            $table->unsignedTinyInteger('info_grade')->default(1)->after('math_grade');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['class', 'math_grade', 'info_grade']);
        });
    }
}
