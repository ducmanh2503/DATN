<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\User;
use App\Models\Movie;
use App\Models\Showtime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Lấy ngày hiện tại
        $date = $request->input('date');
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();
        $startOfMonth = Carbon::parse($date)->startOfMonth();
        $endOfMonth = Carbon::parse($date)->endOfMonth();

        // 1. Thống kê tổng quan
        // 1.1. Doanh thu trong ngày
        $dailyRevenue = Booking::whereBetween('bookings.created_at', [$startOfDay, $endOfDay])
            ->selectRaw('SUM(total_ticket_price + total_combo_price) as total_revenue')
            ->value('total_revenue') ?? 0;

        // 1.2. Khách hàng mới trong tháng
        $newCustomers = User::whereBetween('created_at', [$startOfMonth, $endOfDay])
            ->count();

        // 1.3. Tổng vé bán ra trong ngày
        $totalTicketsSold = BookingDetail::whereHas('booking', function ($query) use ($startOfDay, $endOfDay) {
            $query->whereBetween('bookings.created_at', [$startOfDay, $endOfDay]);
        })
            ->whereNotNull('seat_id') // Chỉ tính các booking detail có ghế (vé)
            ->count();

        // 1.4. Tổng doanh thu từ đầu tháng đến ngày hiện tại
        $monthlyRevenue = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->selectRaw('SUM(total_ticket_price + total_combo_price) as total_revenue')
            ->value('total_revenue') ?? 0;

        // 2. Biểu đồ doanh thu phim (từ đầu tháng đến ngày hiện tại)
        $movieRevenueChart = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->select('movies.title')
            ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
            ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->groupBy('movies.id', 'movies.title')
            ->orderBy('total_revenue', 'desc')
            ->get()
            ->map(function ($item) use ($startOfMonth) {
                return [
                    'movie_title' => $item->title,
                    'total_revenue' => (int) $item->total_revenue,
                    'month_year' => Carbon::parse($startOfMonth)->format('m/Y'), // Thêm tháng/năm
                ];
            });

        // 3. Thống kê chi tiết: Doanh thu theo phim
        $movieStats = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->select('movies.title')
            ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
            ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->groupBy('movies.id', 'movies.title')
            ->orderBy('total_revenue', 'desc')
            ->get()
            ->map(function ($item) use ($startOfMonth, $endOfDay) {
                // Đếm số vé riêng cho phim này
                $totalTickets = BookingDetail::whereHas('booking', function ($query) use ($startOfMonth, $endOfDay, $item) {
                    $query->whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
                        ->whereHas('showtime.calendarShow.movie', function ($query) use ($item) {
                            $query->where('title', $item->title);
                        });
                })
                    ->whereNotNull('seat_id')
                    ->count();

                return [
                    'movie_title' => $item->title,
                    'total_tickets' => (int) $totalTickets,
                    'total_revenue' => (int) $item->total_revenue,
                    'month_year' => Carbon::parse($startOfMonth)->format('m/Y'), // Thêm tháng/năm
                ];
            });

        // 4. Thống kê: Doanh thu 7 ngày gần nhất (theo thứ trong tuần)
        $startOf7Days = Carbon::parse($date)->subDays(6)->startOfDay(); // 7 ngày tính từ ngày hiện tại trở về trước
        $endOf7Days = Carbon::parse($date)->endOfDay();

        // Lấy doanh thu từ cơ sở dữ liệu
        $revenueData = Booking::whereBetween('bookings.created_at', [$startOf7Days, $endOf7Days])
            ->selectRaw('DATE(bookings.created_at) as date')
            ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Tạo mảng 7 ngày với thứ và ngày cụ thể
        $revenueLast7Days = collect(range(0, 6))->map(function ($i) use ($startOf7Days, $revenueData) {
            $day = Carbon::parse($startOf7Days)->addDays($i);
            $dayString = $day->format('Y-m-d');
            $revenue = $revenueData->firstWhere('date', $dayString);

            // Chuyển ngày thành thứ trong tuần (T2, T3, ..., CN)
            $dayOfWeek = $day->dayOfWeek;
            $dayLabel = match ($dayOfWeek) {
                1 => 'T2',
                2 => 'T3',
                3 => 'T4',
                4 => 'T5',
                5 => 'T6',
                6 => 'T7',
                0 => 'CN',
                default => 'Unknown',
            };

            return [
                'day' => $dayLabel,
                'date' => $day->format('d/m/Y'), // Định dạng ngày/tháng/năm
                'total_revenue' => (int) ($revenue ? $revenue->total_revenue : 0),
            ];
        });

        // 5. Thống kê: Tổng số người dùng, phim đang chiếu, và suất chiếu trong ngày
        // 5.1. Tổng số người dùng
        $totalUsers = User::count();

        // 5.2. Số phim đang chiếu trong ngày
        $moviesShowingToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->distinct('movies.id')
            ->count('movies.id');

        // 5.3. Tổng số suất chiếu trong ngày
        $showtimesToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->count();

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Thống kê hệ thống',
            'data' => [
                'overview' => [
                    'daily_revenue' => [
                        'value' => (int) $dailyRevenue,
                        'date' => Carbon::parse($date)->format('d/m/Y'), // Thêm ngày/tháng/năm
                    ],
                    'new_customers' => (int) $newCustomers,
                    'total_tickets_sold' => (int) $totalTicketsSold,
                    'monthly_revenue' => [
                        'value' => (int) $monthlyRevenue,
                        'month_year' => Carbon::parse($startOfMonth)->format('m/Y'), // Thêm tháng/năm
                    ],
                ],
                'movie_revenue_chart' => $movieRevenueChart,
                'movie_stats' => $movieStats,
                'revenue_last_7_days' => $revenueLast7Days,
                'additional_stats' => [
                    'total_users' => (int) $totalUsers,
                    'movies_showing_today' => (int) $moviesShowingToday,
                    'showtimes_today' => (int) $showtimesToday,
                ],
            ],
        ]);
    }
}
