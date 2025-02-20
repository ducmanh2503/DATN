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
        Schema::create('_calendar_show', function (Blueprint $table) {
            $table->id();

            $table->foreignId('movie_id')->constrained('movies');
          
            $table->date('show_date');
            $table->time('end_date');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('_calendar_show');
    }
};
