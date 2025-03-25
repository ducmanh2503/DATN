<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;

class OverviewSheet implements FromArray, WithTitle
{
    protected $overview;

    public function __construct($overview)
    {
        $this->overview = $overview;
    }

    public function array(): array
    {
        return [
            ['Overview Statistics'],
            [],
            ['Daily Revenue', $this->overview['daily_revenue']['value']],
            ['Period', $this->overview['daily_revenue']['period']],
            ['New Customers', $this->overview['new_customers']],
            ['Total Tickets Sold', $this->overview['total_tickets_sold']],
            ['Monthly Revenue', $this->overview['monthly_revenue']['value']],
            ['Period', $this->overview['monthly_revenue']['period']],
        ];
    }

    public function title(): string
    {
        return 'Overview';
    }
}
