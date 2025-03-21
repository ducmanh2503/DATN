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
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cart_id')->constrained('cart');
            $table->foreignId('seat_id')->constrained('seats');
            $table->foreignId('combo_id')->constrained('combos');

            $table->decimal('price_SATOBK',15,2);
            $table->decimal('price_FATOBK',15,2);
            $table->decimal('total_price', 15, 2);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
