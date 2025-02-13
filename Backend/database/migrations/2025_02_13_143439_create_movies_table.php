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
            
            $table->string('title')->unique();
            $table->foreignId('genre_id')->constrained('genres');
            $table->date('release_date');
            $table->string('running_time');
            $table->string('language');
            $table->text('description');
            $table->string('poster');
            $table->string('trailer')->nullable();
            $table->enum('movie_status', ['now_showing', 'comming_soon']);

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
