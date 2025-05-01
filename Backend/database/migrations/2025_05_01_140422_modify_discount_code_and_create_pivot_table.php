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
        // Xóa cột user_id và khóa ngoại từ bảng discount_code
        Schema::table('discount_code', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        // Tạo bảng trung gian discount_code_user
        Schema::create('discount_code_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('discount_code_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            // Khóa ngoại
            $table->foreign('discount_code_id')->references('id')->on('discount_code')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Đảm bảo mỗi cặp discount_code_id và user_id là duy nhất
            $table->unique(['discount_code_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Xóa bảng trung gian
        Schema::dropIfExists('discount_code_user');

        // Thêm lại cột user_id và khóa ngoại vào bảng discount_code
        Schema::table('discount_code', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
