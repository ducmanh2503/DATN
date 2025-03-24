<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\User;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Lấy ngày hiện tại (hoặc ngày từ request, mặc định là ngày hiện tại 25/3/2025)
        $date = $request->input('date', '2025-03-25');
        $startOfDay = Carbon::parse($date)->startOfDay();
        $endOfDay = Carbon::parse($date)->endOfDay();
        $startOfMonth = Carbon::parse($date)->startOfMonth();
        $endOfMonth = Carbon::parse($date)->endOfMonth();

        // 1. Thống kê tổng quan
        // 1.1. Doanh thu trong ngày
        $dailyRevenue = Booking::whereBetween('bookings.created_at', [$startOfDay, $endOfDay])
            ->selectRaw('SUM(total_ticket_price + total_combo_price) as total_revenue')
            ->value('total_revenue') ?? 0;

        // 1.2. Khách hàng mới trong ngày
        $newCustomers = User::whereBetween('created_at', [$startOfDay, $endOfDay])
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
            ->map(function ($item) {
                return [
                    'movie_title' => $item->title,
                    'total_revenue' => $item->total_revenue,
                ];
            });

        // 3. Thống kê chi tiết: Doanh thu theo phim
        // Tách biệt việc đếm vé và tính doanh thu để tránh lặp lại
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
                    'total_tickets' => $totalTickets,
                    'total_revenue' => $item->total_revenue,
                ];
            });

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Thống kê hệ thống',
            'data' => [
                'overview' => [
                    'daily_revenue' => $dailyRevenue,
                    'new_customers' => $newCustomers,
                    'total_tickets_sold' => $totalTicketsSold,
                    'monthly_revenue' => $monthlyRevenue,
                ],
                'movie_revenue_chart' => $movieRevenueChart,
                'movie_stats' => $movieStats,
            ],
        ]);
    }
}
