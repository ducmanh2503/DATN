<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\User;
use App\Models\Movie;
use App\Models\Showtime;
use App\Models\CalendarShow;
use App\Exports\StatsByDateRangeExport;
use App\Models\Movies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        // Lấy ngày hiện tại
        $date = $request->input('date') ?? Carbon::now()->format('Y-m-d'); // Nếu không truyền date, lấy ngày hiện tại
        $currentDate = Carbon::now()->format('d-m-Y'); // Ngày hiện at để trả về

        // Xử lý định dạng ngày
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
            // Nếu date có định dạng d/m/Y (ví dụ: 25/03/2025)
            $startOfDay = Carbon::createFromFormat('d/m/Y', $date)->startOfDay();
            $endOfDay = Carbon::createFromFormat('d/m/Y', $date)->endOfDay();
            $startOfMonth = Carbon::createFromFormat('d/m/Y', $date)->startOfMonth();
            $endOfMonth = Carbon::createFromFormat('d/m/Y', $date)->endOfMonth();
        } else {
            // Nếu date có định dạng Y-m-d (ví dụ: 2025-03-25)
            $startOfDay = Carbon::parse($date)->startOfDay();
            $endOfDay = Carbon::parse($date)->endOfDay();
            $startOfMonth = Carbon::parse($date)->startOfMonth();
            $endOfMonth = Carbon::parse($date)->endOfMonth();
        }

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

        // 3. Thống kê chi tiết: Doanh thu theo phim (từ show_date đến ngày hiện tại)
        $movies = Movies::query()
            ->select('id', 'title')
            ->get();

        $movieStats = collect();
        foreach ($movies as $movie) {
            // Lấy ngày bắt đầu và ngày kết thúc lịch chiếu (show_date và end_date) của phim
            $calendarShow = CalendarShow::query()
                ->where('movie_id', $movie->id)
                ->select('show_date', 'end_date') // Thêm end_date
                ->orderBy('show_date', 'asc') // Lấy ngày bắt đầu sớm nhất
                ->first();

            // Nếu không có lịch chiếu, bỏ qua phim này
            if (!$calendarShow || !$calendarShow->show_date) {
                continue;
            }

            $showDate = Carbon::parse($calendarShow->show_date)->startOfDay();
            $endDate = $calendarShow->end_date ? Carbon::parse($calendarShow->end_date)->startOfDay() : null; // Lấy end_date

            // Thống kê doanh thu và số vé từ show_date đến ngày hiện tại
            $bookings = Booking::whereBetween('bookings.created_at', [$showDate, $endOfDay])
                ->select('movies.title')
                ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
                ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
                ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
                ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
                ->where('movies.id', $movie->id)
                ->groupBy('movies.id', 'movies.title')
                ->first();

            // Đếm số vé riêng cho phim này
            $totalTickets = BookingDetail::whereHas('booking', function ($query) use ($showDate, $endOfDay, $movie) {
                $query->whereBetween('bookings.created_at', [$showDate, $endOfDay])
                    ->whereHas('showtime.calendarShow', function ($query) use ($movie) {
                        $query->where('movie_id', $movie->id);
                    });
            })
                ->whereNotNull('seat_id')
                ->count();

            if ($bookings) {
                $movieStats->push([
                    'movie_title' => $bookings->title,
                    'total_tickets' => (int) $totalTickets,
                    'total_revenue' => (int) ($bookings->total_revenue ?? 0),
                    'show_date' => $showDate->format('d-m-Y'), // Ngày bắt đầu lịch chiếu
                    'end_date' => $endDate ? $endDate->format('d-m-Y') : 'N/A', // Ngày kết thúc lịch chiếu
                ]);
            }
        }

        // Sắp xếp movieStats theo doanh thu giảm dần
        $movieStats = $movieStats->sortByDesc('total_revenue')->values();

        // 4. Thống kê: Doanh thu 7 ngày gần nhất (theo thứ trong tuần)
        $startOf7Days = Carbon::parse($startOfDay)->subDays(6)->startOfDay(); // 7 ngày tính từ ngày hiện tại trở về trước
        $endOf7Days = Carbon::parse($endOfDay)->endOfDay();

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

        // 6. Thống kê khung giờ có số lượng ghế được đặt nhiều nhất trong ngày
        $peakShowtime = Showtime::query()
            ->select('show_times.id', 'show_times.start_time', 'show_times.end_time')
            ->selectRaw('COUNT(booking_details.id) as total_seats_booked')
            ->leftJoin('bookings', 'show_times.id', '=', 'bookings.showtime_id')
            ->leftJoin('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->whereBetween('show_times.start_time', [$startOfDay, $endOfDay])
            ->whereNotNull('booking_details.seat_id') // Chỉ tính các booking detail có ghế (vé)
            ->groupBy('show_times.id', 'show_times.start_time', 'show_times.end_time')
            ->orderBy('total_seats_booked', 'desc')
            ->first();

        $peakShowtimeData = $peakShowtime ? [
            'showtime' => sprintf('%s - %s', Carbon::parse($peakShowtime->start_time)->format('H:i'), Carbon::parse($peakShowtime->end_time)->format('H:i')),
            'total_seats_booked' => (int) ($peakShowtime->total_seats_booked ?? 0),
        ] : [
            'showtime' => 'N/A',
            'total_seats_booked' => 0,
        ];

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Thống kê hệ thống',
            'current_date' => $currentDate, // Thêm ngày hiện tại
            'data' => [
                'overview' => [
                    'daily_revenue' => [
                        'value' => (int) $dailyRevenue,
                        'date' => Carbon::parse($startOfDay)->format('d/m/Y'), // Thêm ngày/tháng/năm
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
                    'peak_showtime' => $peakShowtimeData,
                ],
            ],
        ]);
    }

    public function statsByDateRange(Request $request)
    {
        // Lấy ngày hiện tại
        $currentDate = Carbon::now()->format('d-m-Y'); // Ngày hiện tại để trả về

        // Lấy khoảng ngày từ request (start_date và end_date)
        $startDate = $request->input('start_date'); // Ví dụ: 2024-04-01
        $endDate = $request->input('end_date');     // Ví dụ: 2024-04-15

        // Kiểm tra nếu không có start_date hoặc end_date
        if (!$startDate || !$endDate) {
            return response()->json([
                'message' => 'Vui lòng cung cấp start_date và end_date',
            ], 400);
        }

        // Xử lý định dạng ngày
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $startDate) && preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $endDate)) {
            // Nếu start_date và end_date có định dạng d/m/Y (ví dụ: 25/03/2025)
            $startOfDay = Carbon::createFromFormat('d/m/Y', $startDate)->startOfDay();
            $endOfDay = Carbon::createFromFormat('d/m/Y', $endDate)->endOfDay();
            $startOfMonth = Carbon::createFromFormat('d/m/Y', $startDate)->startOfDay();
            $endOfMonth = Carbon::createFromFormat('d/m/Y', $endDate)->endOfDay();
        } else {
            // Nếu start_date và end_date có định dạng Y-m-d (ví dụ: 2025-03-25)
            $startOfDay = Carbon::parse($startDate)->startOfDay();
            $endOfDay = Carbon::parse($endDate)->endOfDay();
            $startOfMonth = Carbon::parse($startDate)->startOfDay();
            $endOfMonth = Carbon::parse($endDate)->endOfDay();
        }

        // 1. Thống kê tổng quan
        // 1.1. Doanh thu trong khoảng ngày
        $dailyRevenue = Booking::whereBetween('bookings.created_at', [$startOfDay, $endOfDay])
            ->selectRaw('SUM(total_ticket_price + total_combo_price) as total_revenue')
            ->value('total_revenue') ?? 0;

        // 1.2. Khách hàng mới trong khoảng ngày
        $newCustomers = User::whereBetween('created_at', [$startOfMonth, $endOfDay])
            ->count();

        // 1.3. Tổng vé bán ra trong khoảng ngày
        $totalTicketsSold = BookingDetail::whereHas('booking', function ($query) use ($startOfDay, $endOfDay) {
            $query->whereBetween('bookings.created_at', [$startOfDay, $endOfDay]);
        })
            ->whereNotNull('seat_id') // Chỉ tính các booking detail có ghế (vé)
            ->count();

        // 1.4. Tổng doanh thu trong khoảng ngày
        $monthlyRevenue = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->selectRaw('SUM(total_ticket_price + total_combo_price) as total_revenue')
            ->value('total_revenue') ?? 0;

        // 2. Biểu đồ doanh thu phim (trong khoảng ngày)
        $movieRevenueChart = Booking::whereBetween('bookings.created_at', [$startOfMonth, $endOfDay])
            ->select('movies.title')
            ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
            ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->groupBy('movies.id', 'movies.title')
            ->orderBy('total_revenue', 'desc')
            ->get()
            ->map(function ($item) use ($startOfMonth, $endOfDay) {
                return [
                    'movie_title' => $item->title,
                    'total_revenue' => (int) $item->total_revenue,
                    'period' => Carbon::parse($startOfMonth)->format('d/m/Y') . ' - ' . Carbon::parse($endOfDay)->format('d/m/Y'),
                ];
            });

        // 3. Thống kê chi tiết: Doanh thu theo phim (từ show_date đến ngày hiện tại)
        $movies = Movies::query()
            ->select('id', 'title')
            ->get();

        $movieStats = collect();
        foreach ($movies as $movie) {
            // Lấy ngày bắt đầu và ngày kết thúc lịch chiếu (show_date và end_date) của phim
            $calendarShow = CalendarShow::query()
                ->where('movie_id', $movie->id)
                ->select('show_date', 'end_date') // Thêm end_date
                ->orderBy('show_date', 'asc') // Lấy ngày bắt đầu sớm nhất
                ->first();

            // Nếu không có lịch chiếu, bỏ qua phim này
            if (!$calendarShow || !$calendarShow->show_date) {
                continue;
            }

            $showDate = Carbon::parse($calendarShow->show_date)->startOfDay();
            $endDate = $calendarShow->end_date ? Carbon::parse($calendarShow->end_date)->startOfDay() : null; // Lấy end_date
            // Nếu show_date muộn hơn endOfDay, bỏ qua phim này
            if ($showDate->greaterThan($endOfDay)) {
                continue;
            }

            // Thống kê doanh thu và số vé từ show_date đến ngày hiện tại
            $bookings = Booking::whereBetween('bookings.created_at', [$showDate, $endOfDay])
                ->select('movies.title')
                ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
                ->join('show_times', 'bookings.showtime_id', '=', 'show_times.id')
                ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
                ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
                ->where('movies.id', $movie->id)
                ->groupBy('movies.id', 'movies.title')
                ->first();

            // Đếm số vé riêng cho phim này
            $totalTickets = BookingDetail::whereHas('booking', function ($query) use ($showDate, $endOfDay, $movie) {
                $query->whereBetween('bookings.created_at', [$showDate, $endOfDay])
                    ->whereHas('showtime.calendarShow', function ($query) use ($movie) {
                        $query->where('movie_id', $movie->id);
                    });
            })
                ->whereNotNull('seat_id')
                ->count();

            if ($bookings) {
                $movieStats->push([
                    'movie_title' => $bookings->title,
                    'total_tickets' => (int) $totalTickets,
                    'total_revenue' => (int) ($bookings->total_revenue ?? 0),
                    'show_date' => $showDate->format('d-m-Y'), // Thêm ngày bắt đầu lịch chiếu
                    'end_date' => $endDate ? $endDate->format('d-m-Y') : 'N/A', // Thêm ngày kết thúc lịch chiếu
                ]);
            }
        }

        // Sắp xếp movieStats theo doanh thu giảm dần
        $movieStats = $movieStats->sortByDesc('total_revenue')->values();

        // 4. Thống kê: Doanh thu theo ngày trong khoảng ngày
        $daysInRange = $startOfDay->diffInDays($endOfDay) + 1; // Số ngày trong khoảng
        $revenueData = Booking::whereBetween('bookings.created_at', [$startOfDay, $endOfDay])
            ->selectRaw('DATE(bookings.created_at) as date')
            ->selectRaw('SUM(bookings.total_ticket_price + bookings.total_combo_price) as total_revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Tạo mảng doanh thu theo ngày trong khoảng
        $revenueLastDays = collect(range(0, $daysInRange - 1))->map(function ($i) use ($startOfDay, $revenueData) {
            $day = Carbon::parse($startOfDay)->addDays($i);
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

        // 5. Thống kê: Tổng số người dùng, phim đang chiếu, và suất chiếu trong khoảng ngày
        // 5.1. Tổng số người dùng
        $totalUsers = User::count();

        // 5.2. Số phim đang chiếu trong khoảng ngày
        $moviesShowingToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->join('calendar_show', 'show_times.calendar_show_id', '=', 'calendar_show.id')
            ->join('movies', 'calendar_show.movie_id', '=', 'movies.id')
            ->distinct('movies.id')
            ->count('movies.id');

        // 5.3. Tổng số suất chiếu trong khoảng ngày
        $showtimesToday = Showtime::whereBetween('start_time', [$startOfDay, $endOfDay])
            ->count();

        // 6. Thống kê khung giờ có số lượng ghế được đặt nhiều nhất trong khoảng ngày
        $peakShowtime = Showtime::query()
            ->select('show_times.id', 'show_times.start_time', 'show_times.end_time')
            ->selectRaw('COUNT(booking_details.id) as total_seats_booked')
            ->leftJoin('bookings', 'show_times.id', '=', 'bookings.showtime_id')
            ->leftJoin('booking_details', 'bookings.id', '=', 'booking_details.booking_id')
            ->whereBetween('show_times.start_time', [$startOfDay, $endOfDay])
            ->whereNotNull('booking_details.seat_id') // Chỉ tính các booking detail có ghế (vé)
            ->groupBy('show_times.id', 'show_times.start_time', 'show_times.end_time')
            ->orderBy('total_seats_booked', 'desc')
            ->first();

        $peakShowtimeData = $peakShowtime ? [
            'showtime' => sprintf('%s - %s', Carbon::parse($peakShowtime->start_time)->format('H:i'), Carbon::parse($peakShowtime->end_time)->format('H:i')),
            'total_seats_booked' => (int) ($peakShowtime->total_seats_booked ?? 0),
        ] : [
            'showtime' => 'N/A',
            'total_seats_booked' => 0,
        ];

        // Trả về phản hồi API
        return response()->json([
            'message' => 'Thống kê hệ thống theo khoảng ngày',
            'current_date' => $currentDate, // Thêm ngày hiện tại
            'data' => [
                'overview' => [
                    'daily_revenue' => [
                        'value' => (int) $dailyRevenue,
                        'period' => Carbon::parse($startOfDay)->format('d/m/Y') . ' - ' . Carbon::parse($endOfDay)->format('d/m/Y'),
                    ],
                    'new_customers' => (int) $newCustomers,
                    'total_tickets_sold' => (int) $totalTicketsSold,
                    'monthly_revenue' => [
                        'value' => (int) $monthlyRevenue,
                        'period' => Carbon::parse($startOfMonth)->format('d/m/Y') . ' - ' . Carbon::parse($endOfDay)->format('d/m/Y'),
                    ],
                ],
                'movie_revenue_chart' => $movieRevenueChart,
                'movie_stats' => $movieStats,
                'revenue_last_days' => $revenueLastDays, // Đổi tên để phản ánh khoảng ngày
                'additional_stats' => [
                    'total_users' => (int) $totalUsers,
                    'movies_showing_today' => (int) $moviesShowingToday,
                    'showtimes_today' => (int) $showtimesToday,
                    'peak_showtime' => $peakShowtimeData,
                ],
            ],
        ]);
    }

    public function exportStatsByDateRange(Request $request)
    {
        // Lấy dữ liệu từ hàm statsByDateRange
        $statsResponse = $this->statsByDateRange($request);

        // Kiểm tra nếu có lỗi (ví dụ: thiếu start_date hoặc end_date)
        if ($statsResponse->getStatusCode() !== 200) {
            return $statsResponse; // Trả về lỗi nếu có
        }

        $data = $statsResponse->getData(true)['data'];
        $startDate = $request->input('start_date', Carbon::now()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Định dạng tên file
        $fileName = 'stats_by_date_range_' . Carbon::parse($startDate)->format('Ymd') . '_to_' . Carbon::parse($endDate)->format('Ymd') . '.xlsx';

        return Excel::download(new StatsByDateRangeExport($startDate, $endDate, $data), $fileName);
    }
}
