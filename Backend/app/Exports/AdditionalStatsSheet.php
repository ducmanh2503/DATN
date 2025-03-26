<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class AdditionalStatsSheet implements FromArray, WithTitle
{
    protected $additionalStats;

    public function __construct($additionalStats)
    {
        $this->additionalStats = $additionalStats;
    }

    public function array(): array
    {
        return [
            ['Thống kê bổ sung'],
            [],
            ['Tổng số người dùng', $this->additionalStats['total_users']],
            ['Số phim đang chiếu', $this->additionalStats['movies_showing_today']],
            ['Số suất chiếu', $this->additionalStats['showtimes_today']],
            ['Khung giờ cao điểm', $this->additionalStats['peak_showtime']['showtime']],
            ['Tổng ghế đặt (cao điểm)', $this->additionalStats['peak_showtime']['total_seats_booked']],
        ];
    }

    public function title(): string
    {
        return 'Thống kê bổ sung';
    }
}
