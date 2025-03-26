<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class StatsByDateRangeExport implements WithMultipleSheets
{
    protected $startDate;
    protected $endDate;
    protected $data;

    public function __construct($startDate, $endDate, $data)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->data = $data;
    }

    public function sheets(): array
    {
        $sheets = [];

        // Sheet 1: Tổng quan
        $sheets[] = new OverviewSheet($this->data['overview']);

        // Sheet 2: Biểu đồ doanh thu phim
        $sheets[] = new MovieRevenueChartSheet($this->data['movie_revenue_chart']);

        // Sheet 3: Thống kê phim
        $sheets[] = new MovieStatsSheet($this->data['movie_stats']);

        // Sheet 4: Doanh thu theo ngày
        $sheets[] = new RevenueLastDaysSheet($this->data['revenue_last_days']);

        // Sheet 5: Thống kê bổ sung
        $sheets[] = new AdditionalStatsSheet($this->data['additional_stats']);

        return $sheets;
    }
}
