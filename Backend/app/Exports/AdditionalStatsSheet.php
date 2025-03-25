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
            ['Additional Statistics'],
            [],
            ['Total Users', $this->additionalStats['total_users']],
            ['Movies Showing Today', $this->additionalStats['movies_showing_today']],
            ['Showtimes Today', $this->additionalStats['showtimes_today']],
            ['Peak Showtime', $this->additionalStats['peak_showtime']['showtime']],
            ['Total Seats Booked (Peak)', $this->additionalStats['peak_showtime']['total_seats_booked']],
        ];
    }

    public function title(): string
    {
        return 'Additional Stats';
    }
}
