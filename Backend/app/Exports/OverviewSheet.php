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
            ['Thống kê tổng quan'], // Thay "Overview Statistics" thành tiếng Việt
            [],
            ['Doanh thu trong khoảng', $this->overview['daily_revenue']['value']],
            ['Thời gian', $this->overview['daily_revenue']['period']],
            ['Khách hàng mới', $this->overview['new_customers']],
            ['Tổng vé bán ra', $this->overview['total_tickets_sold']],
            ['Doanh thu từ đầu tháng', $this->overview['monthly_revenue']['value']],
            ['Thời gian', $this->overview['monthly_revenue']['period']],
        ];
    }

    public function title(): string
    {
        return 'Tổng quan'; // Thay "Overview" thành tiếng Việt
    }
}
