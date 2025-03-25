<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MovieStatsSheet implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected $movieStats;

    public function __construct($movieStats)
    {
        $this->movieStats = $movieStats;
    }

    public function collection()
    {
        return collect($this->movieStats)->map(function ($item) {
            return [
                'movie_title' => $item['movie_title'],
                'total_tickets' => $item['total_tickets'],
                'total_revenue' => number_format($item['total_revenue'], 0, ',', '.'), // Định dạng số tiền
                'show_date' => $item['show_date'],
                'end_date' => $item['end_date'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Tên phim',
            'Tổng vé',
            'Tổng doanh thu',
            'Ngày bắt đầu chiếu',
            'Ngày kết thúc chiếu',
        ];
    }

    public function title(): string
    {
        return 'Thống kê phim';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Định dạng tiêu đề cột
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFCCCCCC'],
                ],
            ],
            // Căn giữa cột "Tổng vé"
            'B' => ['alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]],
        ];
    }
}
