<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReleaseExpiredSeats implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        // Lấy danh sách ghế bị giữ
        $seats = Cache::get('held_seats', []);

        foreach ($seats as $seat => $data) {
            if (now()->greaterThan($data['expires_at'])) {
                // Xóa ghế khỏi Redis
                Cache::forget("seat_$seat");

                // Xóa token đăng nhập của user giữ ghế này
                DB::table('personal_access_tokens')
                    ->where('tokenable_id', $data['user_id'])
                    ->delete();

                // Phát sự kiện cập nhật ghế
                broadcast(new \App\Events\SeatHeldEvent($seat, null));
            }
        }
    }
}
