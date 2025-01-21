<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('movies', function (Blueprint $table) {
            $table->id();

            $table->string('title', 255)->unique();
            $table->string('director', 255);
            $table->text('actors');
            $table->string('genre', 100);
            $table->integer('duration');
            $table->integer('time');
            $table->string('language', 100);
            $table->string('rated', 255);
            $table->string('trailer')->unique()->nullable();
            $table->text('description')->nullable();
            $table->string('poster')->unique()->nullable();
            $table->enum('movie_status', ['coming_soon', 'now_showing']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
