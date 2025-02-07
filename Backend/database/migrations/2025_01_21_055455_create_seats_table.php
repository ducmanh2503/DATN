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
        Schema::create('seats', function (Blueprint $table) {
            $table->id();

            $table->string('seat_number', 50);
            $table->string('row', 50);
            $table->string('type', 50);
            $table->enum('seat_status', ['available', 'booked']);
            $table->unsignedBigInteger('room_id'); 

            $table->foreign('room_id')->references('id')->on('room')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
