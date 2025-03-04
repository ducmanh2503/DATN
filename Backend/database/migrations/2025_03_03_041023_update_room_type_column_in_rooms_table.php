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
        Schema::disableForeignKeyConstraints();
        Schema::table('rooms', function (Blueprint $table) {
            $table->enum('room_type', ['222D', '333D', '444D', 'IMAX', 'VIP'])->change();
            Schema::enableForeignKeyConstraints();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->enum('room_type', ['222D', '333D', '444D', 'IMAX', 'VIP'])->change();
        });
    }
};
