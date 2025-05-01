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
        Schema::table('discount_code', function (Blueprint $table) {
            // Thêm cột user_id
            $table->unsignedBigInteger('user_id')->nullable()->after('id');

            // Thêm khóa ngoại liên kết với bảng users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discount_code', function (Blueprint $table) {
            // Xóa khóa ngoại trước
            $table->dropForeign(['user_id']);

            // Xóa cột user_id
            $table->dropColumn('user_id');
        });
    }
};
