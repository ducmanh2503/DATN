<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class MovieRevenueChartSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $movieRevenueChart;

    public function __construct($movieRevenueChart)
    {
        $this->movieRevenueChart = $movieRevenueChart;
    }

    public function collection()
    {
        return collect($this->movieRevenueChart)->map(function ($item) {
            return [
                'movie_title' => $item['movie_title'],
                'total_revenue' => number_format($item['total_revenue'], 0, ',', '.'),
                'period' => $item['period'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Tên phim',
            'Tổng doanh thu',
            'Thời gian',
        ];
    }

    public function title(): string
    {
        return 'Doanh thu phim';
    }
}
