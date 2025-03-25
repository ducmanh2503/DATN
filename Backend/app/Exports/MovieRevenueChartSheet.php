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
        return collect($this->movieRevenueChart);
    }

    public function headings(): array
    {
        return [
            'Movie Title',
            'Total Revenue',
            'Period',
        ];
    }

    public function title(): string
    {
        return 'Movie Revenue Chart';
    }
}
