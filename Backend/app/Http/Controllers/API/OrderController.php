<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $bookings = Booking::query()
            ->latest('id')
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster'); // Lấy thông tin phim
                                        }
                                    ]);
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name'); // Lấy tên loại phòng từ room_types
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'status',
                'created_at' // Thêm created_at để lấy ngày đặt
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name; // Tên phòng (ví dụ: Cinema 1)
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null; // Loại phòng (ví dụ: IMAX)
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name, // Đổi tên key thành combo_name để rõ ràng
                                'quantity' => $detail->quantity,
                                'price' => $detail->price,
                            ];
                        }
                    }
                }

                return [
                    'id' => $booking->id,
                    'customer_name' => $booking->user->name ?? 'N/A',
                    'phone' => $booking->user->phone ?? 'N/A',
                    'email' => $booking->user->email ?? 'N/A',
                    'showtime' => $booking->showtime
                        ? "{$booking->showtime->start_time} - {$booking->showtime->end_time}"
                        : 'N/A',
                    'movie_title' => $movie ? $movie['title'] : 'N/A', // Tên phim
                    'room_name' => $room_name ?? 'N/A', // Tên phòng (thay cho Rạp chiếu)
                    'room_type' => $room_type ?? 'N/A', // Loại phòng (lấy từ room_types)
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => $booking->total_ticket_price,
                    'total_combo_price' => $booking->total_combo_price,
                    'total_price' => $booking->total_ticket_price + $booking->total_combo_price, // Tổng tiền
                    'status' => $booking->status,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A', // Ngày đặt, định dạng ngày-tháng-năm
                ];
            });

        return response()->json([
            'message' => 'Danh sách đơn hàng',
            'data' => $bookings,
        ]);
    }

    public function show($bookingId)
    {
        $booking = Booking::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster'); // Lấy thông tin phim
                                        }
                                    ]);
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name'); // Lấy tên loại phòng từ room_types
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'status',
                'created_at' // Thêm created_at để lấy ngày đặt
            )
            ->find($bookingId);

        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
        $seats = [];
        $room_name = null;
        $room_type = null;
        $combos = [];
        $movie = null;

        // Lấy thông tin phim từ showtime -> calendarShow -> movie
        if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
            $movie = [
                'id' => $booking->showtime->calendarShow->movie->id,
                'title' => $booking->showtime->calendarShow->movie->title,
                'poster' => $booking->showtime->calendarShow->movie->poster,
            ];
        }

        if ($booking->bookingDetails) {
            foreach ($booking->bookingDetails as $detail) {
                if ($detail->seat) {
                    $seatName = "{$detail->seat->row}{$detail->seat->column}";
                    $seats[] = [
                        'booking_detail_id' => $detail->id,
                        'seat_name' => $seatName,
                        'price' => $detail->price,
                    ];

                    // Lấy tên phòng và loại phòng
                    if ($detail->seat->room) {
                        $room_name = $detail->seat->room->name; // Tên phòng (ví dụ: Cinema 1)
                        $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null; // Loại phòng (ví dụ: IMAX)
                    }
                }

                if ($detail->combo) {
                    $combos[] = [
                        'booking_detail_id' => $detail->id,
                        'combo_name' => $detail->combo->name, // Đổi tên key thành combo_name
                        'quantity' => $detail->quantity,
                        'price' => $detail->price,
                    ];
                }
            }
        }

        $formattedBooking = [
            'id' => $booking->id,
            'customer_name' => $booking->user->name ?? 'N/A',
            'phone' => $booking->user->phone ?? 'N/A',
            'email' => $booking->user->email ?? 'N/A',
            'showtime' => $booking->showtime
                ? "{$booking->showtime->start_time} - {$booking->showtime->end_time}"
                : 'N/A',
            'movie_title' => $movie ? $movie['title'] : 'N/A', // Tên phim
            'room_name' => $room_name ?? 'N/A', // Tên phòng (thay cho Rạp chiếu)
            'room_type' => $room_type ?? 'N/A', // Loại phòng (lấy từ room_types)
            'seats' => $seats,
            'combos' => $combos,
            'total_ticket_price' => $booking->total_ticket_price,
            'total_combo_price' => $booking->total_combo_price,
            'total_price' => $booking->total_ticket_price + $booking->total_combo_price, // Tổng tiền
            'status' => $booking->status,
            'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A', // Ngày đặt, định dạng ngày-tháng-năm
        ];

        return response()->json([
            'message' => 'Chi tiết đơn hàng',
            'data' => $formattedBooking,
        ]);
    }
}
