<?php


namespace App\Http\Controllers\API;

use App\Events\SeatUpdated;
use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmation;
use App\Models\SeatTypePrice;
use App\Models\ShowTimeSeat;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Seat;
use App\Models\SeatType;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Combo;
use App\Models\ShowTime;
use App\Models\CalendarShow;
use App\Models\Movie;
use App\Models\Movies;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;


class TicketController extends Controller
{
    public function index()
    {
        // Lấy tất cả bản ghi từ seat_type_price và preload các quan hệ
        $ticketPrices = SeatTypePrice::with([
            'seatType',
            'seatType.seat',
            'seatType.seat.room',
            'seatType.seat.room.roomType'
        ])->get();

        // Nhóm dữ liệu theo seat_type_id để xử lý từng loại ghế
        $groupedBySeatType = $ticketPrices->groupBy('seat_type_id');

        $data = [];
        foreach ($groupedBySeatType as $seatTypeId => $group) {
            // Lấy thông tin seatType từ bản ghi đầu tiên
            $seatType = $group->first()->seatType;
            $seatTypeName = $seatType ? $seatType->name : 'Không xác định';

            // Lấy danh sách tất cả phòng và loại phòng liên quan đến seatType
            $roomData = $seatType->seat
                ->map(function ($seat) {
                    if ($seat->room && $seat->room->roomType) {
                        return [
                            'room_name' => $seat->room->name,
                            'room_type' => $seat->room->roomType
                        ];
                    }
                    return null;
                })
                ->filter()
                ->unique(function ($item) {
                    return $item['room_type']->id . '|' . $item['room_name'];
                })
                ->values();

            // Nếu không có phòng, thêm một giá trị mặc định
            if ($roomData->isEmpty()) {
                $roomData = collect([['room_name' => 'Không xác định', 'room_type' => null]]);
            }

            // Tạo bản ghi cho từng phòng và loại phòng
            foreach ($roomData as $roomItem) {
                $roomTypeName = $roomItem['room_type'] ? $roomItem['room_type']->name : 'Không xác định';
                $roomTypePrice = $roomItem['room_type'] ? $roomItem['room_type']->price : 0;
                $roomName = $roomItem['room_name'];

                // Lấy giá cho từng day_type và cộng với giá của loại phòng
                foreach ($group as $ticketPrice) {
                    $totalPrice = $ticketPrice->price + $roomTypePrice;

                    // Định dạng lại tổng giá
                    $formattedTotalPrice = ($totalPrice == floor($totalPrice))
                        ? number_format($totalPrice, 0)
                        : number_format($totalPrice, 2);

                    $data[] = [
                        'seat_type_name' => $seatTypeName,
                        'room_type_name' => $roomTypeName,
                        'room_name' => $roomName,
                        'day_type' => ucfirst($ticketPrice->day_type),
                        'price' => $formattedTotalPrice,
                    ];
                }
            }
        }

        // Sắp xếp lại kết quả
        $data = collect($data)->sortBy([
            ['seat_type_name', 'asc'],
            ['room_type_name', 'asc'],
            ['room_name', 'asc'],
            ['day_type', 'asc']
        ])->values();

        return response()->json([
            'message' => 'Lấy danh sách quản lý vé thành công',
            'data' => $data
        ], 200);
    }

    //---------------------------------test---------------------------------//
    public function show($id)
    {
        try {
            $ticketPrice = SeatTypePrice::with([
                'seatType',
                'seatType.seat',
                'seatType.seat.room',
                'seatType.seat.room.roomType'
            ])->findOrFail($id);

            $seatType = $ticketPrice->seatType;
            $seatTypeName = $seatType ? $seatType->name : 'Không xác định';

            // Lấy thông tin phòng và loại phòng
            $room = $seatType->seat->first() ? $seatType->seat->first()->room : null;
            $roomName = $room ? $room->name : 'Không xác định';
            $roomType = $room && $room->roomType ? $room->roomType : null;
            $roomTypeName = $roomType ? $roomType->name : 'Không xác định';
            $roomTypePrice = $roomType ? $roomType->price : 0;

            $totalPrice = $ticketPrice->price + $roomTypePrice;
            $formattedTotalPrice = ($totalPrice == floor($totalPrice))
                ? number_format($totalPrice, 0)
                : number_format($totalPrice, 2);

            $data = [
                'ticket_price_id' => $ticketPrice->id,
                'seat_type_name' => $seatTypeName,
                'room_type_name' => $roomTypeName,
                'room_name' => $roomName,
                'day_type' => ucfirst($ticketPrice->day_type),
                'base_price' => $ticketPrice->price,
                'room_type_price' => $roomTypePrice,
                'total_price' => $formattedTotalPrice,
                'created_at' => $ticketPrice->created_at,
                'updated_at' => $ticketPrice->updated_at
            ];

            return response()->json([
                'message' => 'Lấy chi tiết vé thành công',
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không tìm thấy vé',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    // Phương thức xóa vé
    public function destroy($id)
    {
        try {
            $ticketPrice = SeatTypePrice::findOrFail($id);
            $ticketPrice->delete();

            return response()->json([
                'message' => 'Xóa vé thành công',
                'ticket_price_id' => $id
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể xóa vé',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    //---------------------------------end-test---------------------------------//




    // public function getTicketDetails(Request $request)
    // {


    //     // if (!auth()->check()) {
    //     //     return response()->json(['error' => 'Unauthorized. Please log in.'], 401);
    //     // }
    //     // Validate dữ liệu từ FE
    //     $request->validate([
    //         'movie_id' => 'required|exists:movies,id',
    //         'showtime_id' => 'required|exists:show_times,id',
    //         'calendar_show_id' => 'required|exists:calendar_show,id',
    //         'seat_ids' => 'required|array',
    //         'seat_ids.*' => 'exists:seats,id',
    //         'combo_ids' => 'nullable|array',
    //         'combo_ids.*' => 'exists:combos,id',
    //         'pricing' => 'required|array',
    //         'pricing.total_ticket_price' => 'required|numeric|min:0',
    //         'pricing.total_combo_price' => 'required|numeric|min:0',
    //         'pricing.total_price' => 'required|numeric|min:0',
    //         'payment_method' => 'required|in:cash,VNpay,Momo,Zalopay',
    //     ]);


    //     // Lấy thông tin phim
    //     $movie = Movies::where('id', $request->movie_id)
    //         ->select('id', 'title', 'rated', 'language', 'poster')
    //         ->first();


    //     // Lấy thông tin lịch chiếu
    //     $calendarShow = CalendarShow::where('id', $request->calendar_show_id)
    //         ->select('id', 'movie_id', 'show_date', 'end_date')
    //         ->first();


    //     // Lấy thông tin suất chiếu
    //     $showTime = ShowTime::where('id', $request->showtime_id)
    //         ->with(['room' => function ($query) {
    //             $query->select('id', 'name', 'room_type_id')
    //                 ->with(['roomType' => function ($query) {
    //                     $query->select('id', 'name', 'price');
    //                 }]);
    //         }])
    //         ->select('id', 'calendar_show_id', 'room_id', 'start_time', 'end_time', 'status')
    //         ->first();


    //     // Lấy thông tin ghế và loại ghế
    //     $seats = Seat::whereIn('id', $request->seat_ids)
    //         ->with(['seatType' => function ($query) {
    //             $query->select('id', 'name');
    //         }])
    //         ->select('id', 'room_id', 'row', 'column', 'seat_type_id')
    //         ->get();


    //     // Lấy thông tin combo (nếu có)
    //     $combos = collect([]);
    //     if ($request->combo_ids) {
    //         $combos = Combo::whereIn('id', $request->combo_ids)
    //             ->select('id', 'name', 'description', 'price', 'image')
    //             ->get();
    //     }


    //     // Lấy giá và phương thức thanh toán từ FE
    //     $pricing = $request->pricing;
    //     $paymentMethod = $request->payment_method;


    //     // Chuẩn bị dữ liệu trả về
    //     $ticketDetails = [
    //         'movie' => $movie,
    //         'calendar_show' => $calendarShow,
    //         'show_time' => [
    //             'start_time' => $showTime->start_time,
    //             'end_time' => $showTime->end_time,
    //             'status' => $showTime->status,
    //             'room' => [
    //                 'name' => $showTime->room->name,
    //                 'room_type' => $showTime->room->roomType->name,
    //                 'price_per_seat' => $showTime->room->roomType->price,
    //             ],
    //         ],
    //         'seats' => $seats->map(function ($seat) {
    //             return [
    //                 'row' => $seat->row,
    //                 'column' => $seat->column,
    //                 'seat_type' => $seat->seatType->name,
    //             ];
    //         }),
    //         'combos' => $combos->map(function ($combo) {
    //             return [
    //                 'name' => $combo->name,
    //                 'description' => $combo->description,
    //                 'price' => $combo->price,
    //                 'image' => $combo->image,
    //             ];
    //         }),
    //         'pricing' => [
    //             'total_ticket_price' => $pricing['total_ticket_price'],
    //             'total_combo_price' => $pricing['total_combo_price'],
    //             'total_price' => $pricing['total_price'],
    //         ],
    //         'payment_method' => $paymentMethod,
    //     ];


    //     // Lưu booking vào bảng bookings
    //     $booking = Booking::create([
    //         'user_id' => auth()->id(), //lấy từ auth
    //         // 'user_id' => $request->user_id, //lấy từ resquet FE gửi
    //         'showtime_id' => $request->showtime_id,
    //         'total_ticket_price' => $pricing['total_ticket_price'],
    //         'total_combo_price' => $pricing['total_combo_price'],
    //         'status' => 'pending',
    //         'payment_method' => $paymentMethod,
    //     ]);


    //     // Lưu chi tiết ghế vào bảng booking_details
    //     $pricePerSeat = $pricing['total_ticket_price'] / count($request->seat_ids); // Giá trung bình mỗi ghế
    //     foreach ($request->seat_ids as $seatId) {
    //         BookingDetail::create([
    //             'booking_id' => $booking->id,
    //             'seat_id' => $seatId,
    //             'price' => $pricePerSeat, // Giá mỗi ghế
    //         ]);
    //     }


    //     $qrData = "Mã đặt vé: {$booking->id}\n" .
    //         "Phim: {$ticketDetails['movie']['title']}\n" .
    //         "Ngày chiếu: {$ticketDetails['calendar_show']['show_date']}\n" .
    //         "Giờ chiếu: {$ticketDetails['show_time']['start_time']} - {$ticketDetails['show_time']['end_time']}\n" .
    //         "Phòng: {$ticketDetails['show_time']['room']['name']} ({$ticketDetails['show_time']['room']['room_type']})\n" .
    //         "Ghế: " . implode(', ', array_map(fn($seat) => "{$seat['row']}{$seat['column']} ({$seat['seat_type']})", $ticketDetails['seats']->toArray()));
    //     $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
    //     $qrCode = base64_encode(file_get_contents($qrUrl));
    //     // Log::info('QR Code Base64 (Controller): ' . $qrCode);
    //     $ticketDetails['qr_code'] = $qrCode; // Thêm QR code vào dữ liệu trả về


    //     $user = User::find(auth()->id());
    //     if ($user && $user->email) {
    //         Mail::to($user->email)->send(new BookingConfirmation($booking, $ticketDetails));
    //     } else {
    //         Log::warning('User ID ' . $request->user_id . ' does not have an email.');
    //     }


    //     // Trả về response
    //     return response()->json([
    //         'success' => true,
    //         'data' => $ticketDetails,
    //         'booking_id' => $booking->id, // Trả thêm ID của booking vừa tạo
    //     ], 200);
    // }


    //-------------------------test-------------------------------//

    private function saveBooking(array $data, string $status)
    {
        // Lưu booking vào bảng bookings
        $booking = Booking::create([
            'user_id' => auth()->id(), //lấy từ auth
            // 'user_id' => $request->user_id, //lấy từ resquet FE gửi
            'showtime_id' => $data['showtime_id'],
            'total_ticket_price' => $data['pricing']['total_ticket_price'],
            'total_combo_price' => $data['pricing']['total_combo_price'],
            'status' => $status,
            'payment_method' => $data['payment_method'],
        ]);

        $pricePerSeat = $data['pricing']['total_ticket_price'] / count($data['seat_ids']); // Giá trung bình mỗi ghế
        foreach ($data['seat_ids'] as $seatId) {
            BookingDetail::create([
                'booking_id' => $booking->id,
                'seat_id' => $seatId,
                'price' => $pricePerSeat, // Giá mỗi ghế
            ]);
        }
        return $booking;
    }


    //cập nhật trạng thái ghế
    private function getSeatingMatrix($roomId, $showTimeId)
    {
        $seats = Seat::where('room_id', $roomId)
            ->with(['seatType', 'showTimeSeat' => function ($query) use ($showTimeId) {
                $query->where('show_time_id', $showTimeId);
            }])
            ->get();

        $userId = auth()->id();
        $currentDate = now()->toDateString();
        $seatingMatrix = [];

        foreach ($seats as $seat) {
            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }

            $showTimeSeat = $seat->showTimeSeat->first();
            $status = $showTimeSeat ? $showTimeSeat->seat_status : 'available';

            $heldSeat = Cache::get("seat_{$showTimeId}_{$seat->id}");
            $isHeld = !empty($heldSeat);
            $heldByUser = $isHeld && $heldSeat['user_id'] == $userId;

            if ($isHeld) {
                $status = 'held';
            }

            $seatCode = $seat->row . $seat->column;
            $price = SeatTypePrice::getPriceByDate($seat->seat_type_id, $currentDate) ?? 0;

            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode,
                'type' => $seat->seatType->name,
                'status' => $status,
                'isHeld' => $isHeld,
                'heldByUser' => $heldByUser,
                'price' => $price,
            ];
        }

        return array_values($seatingMatrix);
    }


    public function getTicketDetails(Request $request)
    {

        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'showtime_id' => 'required|exists:show_times,id',
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
            'combo_ids' => 'nullable|array',
            'combo_ids.*' => 'exists:combos,id',
            'pricing' => 'required|array',
            'pricing.total_ticket_price' => 'required|numeric|min:0',
            'pricing.total_combo_price' => 'required|numeric|min:0',
            'pricing.total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,VNpay,Momo,Zalopay',
            'is_payment_completed' => 'sometimes|boolean',
        ]);


        // Lấy thông tin phim
        $movie = Movies::where('id', $request->movie_id)
            ->select('id', 'title', 'rated', 'language', 'poster')
            ->first();


        // Lấy thông tin lịch chiếu
        $calendarShow = CalendarShow::where('id', $request->calendar_show_id)
            ->select('id', 'movie_id', 'show_date', 'end_date')
            ->first();


        // Lấy thông tin suất chiếu
        $showTime = ShowTime::where('id', $request->showtime_id)
            ->with(['room' => function ($query) {
                $query->select('id', 'name', 'room_type_id')
                    ->with(['roomType' => function ($query) {
                        $query->select('id', 'name', 'price');
                    }]);
            }])
            ->select('id', 'calendar_show_id', 'room_id', 'start_time', 'end_time', 'status')
            ->first();


        // Lấy thông tin ghế và loại ghế
        $seats = Seat::whereIn('id', $request->seat_ids)
            ->with(['seatType' => function ($query) {
                $query->select('id', 'name');
            }])
            ->select('id', 'room_id', 'row', 'column', 'seat_type_id')
            ->get();


        // Lấy thông tin combo (nếu có)
        $combos = collect([]);
        if ($request->combo_ids) {
            $combos = Combo::whereIn('id', $request->combo_ids)
                ->select('id', 'name', 'description', 'price', 'image')
                ->get();
        }


        // Lấy giá và phương thức thanh toán từ FE
        $pricing = $request->pricing;
        $paymentMethod = $request->payment_method;


        // Chuẩn bị dữ liệu trả về
        $ticketDetails = [
            'movie' => $movie,
            'calendar_show' => $calendarShow,
            'show_time' => [
                'start_time' => $showTime->start_time,
                'end_time' => $showTime->end_time,
                'status' => $showTime->status,
                'room' => [
                    'name' => $showTime->room->name,
                    'room_type' => $showTime->room->roomType->name,
                    'price_per_seat' => $showTime->room->roomType->price,
                ],
            ],
            'seats' => $seats->map(function ($seat) {
                return [
                    'row' => $seat->row,
                    'column' => $seat->column,
                    'seat_type' => $seat->seatType->name,
                ];
            }),
            'combos' => $combos->map(function ($combo) {
                return [
                    'name' => $combo->name,
                    'description' => $combo->description,
                    'price' => $combo->price,
                    'image' => $combo->image,
                ];
            }),
            'pricing' => [
                'total_ticket_price' => $pricing['total_ticket_price'],
                'total_combo_price' => $pricing['total_combo_price'],
                'total_price' => $pricing['total_price'],
            ],
            'payment_method' => $paymentMethod,
        ];

        $isPaymentCompleted = $request->input('is_payment_completed', false);
        if ($isPaymentCompleted) {
            // Kiểm tra trạng thái ghế trước khi lưu
            foreach ($request->seat_ids as $seatId) {
                $showTimeSeat = ShowTimeSeat::where('show_time_id', $request->showtime_id)
                    ->where('seat_id', $seatId)
                    ->first();
                if ($showTimeSeat && $showTimeSeat->seat_status === 'booked') {
                    return response()->json(['message' => 'Ghế đã được đặt bởi người khác'], 409);
                }
            }


            // Lưu booking vào bảng bookings
            $booking = $this->saveBooking($request->all(), 'confirmed');



            // Cập nhật trạng thái ghế
            foreach ($request->seat_ids as $seatId) {
                $showTimeSeat = ShowTimeSeat::where('show_time_id', $request->showtime_id)
                    ->where('seat_id', $seatId)
                    ->first();
                if ($showTimeSeat) {
                    $showTimeSeat->seat_status = 'booked';
                    $showTimeSeat->save();
                }

                // Xóa cache của ghế
                $cacheKey = "seat_{$request->showtime_id}_{$seatId}";
                if (Cache::has($cacheKey)) {
                    Cache::forget($cacheKey);
                }
            }

            // Phát sự kiện cập nhật trạng thái ghế
            $roomId = $showTime->room_id;
            $seatingMatrix = $this->getSeatingMatrix($roomId, $request->showtime_id);
            broadcast(new SeatUpdated($roomId, $request->showtime_id, $seatingMatrix))->toOthers();


            $qrData = "Mã đặt vé: {$booking->id}\n" .
                "Phim: {$ticketDetails['movie']['title']}\n" .
                "Ngày chiếu: {$ticketDetails['calendar_show']['show_date']}\n" .
                "Giờ chiếu: {$ticketDetails['show_time']['start_time']} - {$ticketDetails['show_time']['end_time']}\n" .
                "Phòng: {$ticketDetails['show_time']['room']['name']} ({$ticketDetails['show_time']['room']['room_type']})\n" .
                "Ghế: " . implode(', ', array_map(fn($seat) => "{$seat['row']}{$seat['column']} ({$seat['seat_type']})", $ticketDetails['seats']->toArray()));
            $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
            $qrCode = base64_encode(file_get_contents($qrUrl));
            // Log::info('QR Code Base64 (Controller): ' . $qrCode);
            $ticketDetails['qr_code'] = $qrCode; // Thêm QR code vào dữ liệu trả về


            $user = User::find(auth()->id());
            if ($user && $user->email) {
                Mail::to($user->email)->send(new BookingConfirmation($booking, $ticketDetails));
            } else {
                Log::warning('User ID ' . $request->user_id . ' does not have an email.');
            }
            // Trả về response với booking_id
            return response()->json([
                'success' => true,
                'data' => $ticketDetails,
                'booking_id' => $booking->id,
            ], 200);
        }

        // Chưa thanh toán thì chỉ trả về thông tin vé
        return response()->json([
            'success' => true,
            'data' => $ticketDetails,
        ], 200);
    }


    //-------------------------end-test-------------------------------//
}
