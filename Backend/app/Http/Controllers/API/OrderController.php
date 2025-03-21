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
                    $query->select('id', 'start_time', 'end_time');
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name');
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
                'status'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế và combo
                $seats = [];
                $rooms = [];
                $combos = [];

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm seat nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id, // Thêm id của bookingDetail
                                'seat_name' => $seatName,
                                'price' => $detail->price,
                            ];

                            // Thêm room_name nếu có
                            $roomName = $detail->seat->room ? $detail->seat->room->name : null;
                            if ($roomName && !in_array($roomName, $rooms)) {
                                $rooms[] = $roomName;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id, // Thêm id của bookingDetail
                                'name' => $detail->combo->name,
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
                    'total_ticket_price' => $booking->total_ticket_price,
                    'total_combo_price' => $booking->total_combo_price,
                    'status' => $booking->status,
                    'seats' => $seats, // Danh sách ghế với booking_detail_id
                    'rooms' => $rooms, // Danh sách phòng
                    'combos' => $combos, // Danh sách combo với booking_detail_id
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
                    $query->select('id', 'start_time', 'end_time');
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name');
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
                'status'
            )
            ->find($bookingId);

        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Khởi tạo danh sách ghế và combo
        $seats = [];
        $rooms = [];
        $combos = [];

        if ($booking->bookingDetails) {
            foreach ($booking->bookingDetails as $detail) {
                if ($detail->seat) {
                    $seatName = "{$detail->seat->row}{$detail->seat->column}";
                    $seats[] = [
                        'booking_detail_id' => $detail->id,
                        'seat_name' => $seatName,
                        'price' => $detail->price,
                    ];

                    $roomName = $detail->seat->room ? $detail->seat->room->name : null;
                    if ($roomName && !in_array($roomName, $rooms)) {
                        $rooms[] = $roomName;
                    }
                }

                if ($detail->combo) {
                    $combos[] = [
                        'booking_detail_id' => $detail->id,
                        'name' => $detail->combo->name,
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
            'total_ticket_price' => $booking->total_ticket_price,
            'total_combo_price' => $booking->total_combo_price,
            'status' => $booking->status,
            'seats' => $seats,
            'rooms' => $rooms,
            'combos' => $combos,
        ];

        return response()->json([
            'message' => 'Danh sách chi tiết đơn hàng',
            'data' => $formattedBooking,
        ]);
    }
}
