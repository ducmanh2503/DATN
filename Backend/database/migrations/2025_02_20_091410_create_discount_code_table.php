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
        Schema::create('discount_code', function (Blueprint $table) {
            $table->id();
            
            $table->string('name_code')->unique();
            $table->decimal('percent', 5, 2);
            $table->unsignedBigInteger('quantity');
            $table->enum('status', ['active', 'inactive']);  
            $table->date('start_date');  // Ngày bắt đầu
            $table->date('end_date');  // Ngày kết thúc

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_code');
    }
};
