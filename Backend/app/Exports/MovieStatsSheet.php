<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;

class MovieStatsSheet implements FromCollection, WithHeadings, WithTitle
{
    protected $movieStats;

    public function __construct($movieStats)
    {
        $this->movieStats = $movieStats;
    }

    public function collection()
    {
        return collect($this->movieStats);
    }

    public function headings(): array
    {
        return [
            'Movie Title',
            'Total Tickets',
            'Total Revenue',
            'Show Date',
            'End Date',
        ];
    }

    public function title(): string
    {
        return 'Movie Stats';
    }
}
