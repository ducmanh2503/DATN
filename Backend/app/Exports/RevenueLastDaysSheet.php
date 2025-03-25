<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class RevenueLastDaysSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $revenueLastDays;

    public function __construct($revenueLastDays)
    {
        $this->revenueLastDays = $revenueLastDays;
    }

    public function collection()
    {
        return collect($this->revenueLastDays);
    }

    public function headings(): array
    {
        return [
            'Day',
            'Date',
            'Total Revenue',
        ];
    }

    public function title(): string
    {
        return 'Revenue Last Days';
    }
}
