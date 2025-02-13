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
        Schema::create('statistics_per_movie', function (Blueprint $table) {
            $table->id();

            $table->foreignId('movie_id')->constrained('movies');
            $table->date('end_date');
            $table->decimal('total_sales', 8, 2);
            $table->integer('total_tickets_sold');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statistics_per_movie');
    }
};
