<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeatSeeder extends Seeder
{
    public function run()
    {
        $rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J']; // Danh sách các hàng
        $columns = range(1, 13); // Các cột từ 1 đến 13
        $room_id = 6; // Giả sử phòng ID là 1

        $seats = [];

        foreach ($rows as $row) {
            // Xác định seat_type_id theo hàng
            if (in_array($row, ['A', 'B', 'C'])) {
                $seat_type_id = 1;
            } elseif (in_array($row, ['D', 'E', 'F', 'G', 'H'])) {
                $seat_type_id = 2;
            } elseif ($row === 'J') {
                $seat_type_id = 3;
            } else {
                $seat_type_id = 1; // Mặc định
            }

            foreach ($columns as $column) {
                $seats[] = [
                    'room_id' => $room_id,
                    'row' => $row,
                    'column' => $column,
                    'seat_type_id' => $seat_type_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('seats')->insert($seats);
    }
}
