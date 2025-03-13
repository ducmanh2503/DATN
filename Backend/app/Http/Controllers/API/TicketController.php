<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmation;
use App\Models\SeatTypePrice;
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


        $result = [];
        foreach ($groupedBySeatType as $seatTypeId => $group) {
            // Lấy thông tin seatType từ bản ghi đầu tiên
            $seatType = $group->first()->seatType;
            $seatTypeName = $seatType ? $seatType->name : 'Không xác định';


            // Lấy danh sách tất cả loại phòng liên quan đến seatType này
            $roomTypes = $seatType->seat
                ->map(function ($seat) {
                    return $seat->room && $seat->room->roomType ? $seat->room->roomType : null;
                })
                ->filter()
                ->unique('id')
                ->values();


            // Nếu không có loại phòng, thêm một giá trị mặc định
            if ($roomTypes->isEmpty()) {
                $roomTypes = collect([null]); // Sẽ hiển thị "Không xác định"
            }


            // Tạo bản ghi cho từng loại phòng
            foreach ($roomTypes as $roomType) {
                $roomTypeName = $roomType ? $roomType->name : 'Không xác định';
                $roomTypePrice = $roomType ? $roomType->price : 0; // Giá của loại phòng (mặc định là 0 nếu không có)


                // Lấy giá cho từng day_type và cộng với giá của loại phòng
                foreach ($group as $ticketPrice) {
                    $totalPrice = $ticketPrice->price + $roomTypePrice; // Tổng giá = giá loại ghế + giá loại phòng


                    // Định dạng lại tổng giá
                    $formattedTotalPrice = ($totalPrice == floor($totalPrice))
                        ? number_format($totalPrice, 0)
                        : number_format($totalPrice, 2);


                    $result[] = [
                        'seat_type_name' => $seatTypeName,
                        'room_type_name' => $roomTypeName,
                        'day_type' => ucfirst($ticketPrice->day_type),
                        'price' => $formattedTotalPrice, // Giá đã cộng
                    ];
                }
            }
        }


        // Sắp xếp lại kết quả
        $result = collect($result)->sortBy([
            ['seat_type_name', 'asc'],
            ['room_type_name', 'asc'],
            ['day_type', 'asc']
        ])->values();


        return response()->json([
            'message' => 'Lấy danh sách quản lý vé thành công',
            'data' => $result
        ], 200);
    }

    // public function getTicketDetails(Request $request)
    // {
    //     // Validate 
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
    //         'payment_method' => 'required|in:cash,VNpay,Momo,Zalopay', // Danh sách phương thức thanh toán
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
    //                   ->with(['roomType' => function ($query) {
    //                       $query->select('id', 'name', 'price');
    //                   }]);
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
    //     $combos = [];
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
    //         'payment_method' => $paymentMethod, // Thêm thông tin phương thức thanh toán
    //     ];

    //     // Trả về response
    //     return response()->json([
    //         'success' => true,
    //         'data' => $ticketDetails,
    //     ], 200);
    // }







    //--------------------------------------------------test--------------------------//


    public function getTicketDetails(Request $request)
    {

        // if (!auth()->check()) {
        //     return response()->json(['error' => 'Unauthorized. Please log in.'], 401);
        // }
        // Validate dữ liệu từ FE
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
        $combos = [];
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

        // Lưu booking vào bảng bookings
        $booking = Booking::create([
            // 'user_id' => auth()->id(), //lấy từ auth
            'user_id' => $request->user_id, //lấy từ resquet FE gửi
            'showtime_id' => $request->showtime_id,
            'total_ticket_price' => $pricing['total_ticket_price'],
            'total_combo_price' => $pricing['total_combo_price'],
            'status' => 'pending',
            'payment_method' => $paymentMethod,
        ]);

        // Lưu chi tiết ghế vào bảng booking_details
        $pricePerSeat = $pricing['total_ticket_price'] / count($request->seat_ids); // Giá trung bình mỗi ghế
        foreach ($request->seat_ids as $seatId) {
            BookingDetail::create([
                'booking_id' => $booking->id,
                'seat_id' => $seatId,
                'price' => $pricePerSeat, // Giá mỗi ghế
            ]);
        }

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

        $user = User::find($request->user_id);
        if ($user && $user->email) {
            Mail::to($user->email)->send(new BookingConfirmation($booking, $ticketDetails));
        } else {
            Log::warning('User ID ' . $request->user_id . ' does not have an email.');
        }

        // Trả về response
        return response()->json([
            'success' => true,
            'data' => $ticketDetails,
            'booking_id' => $booking->id, // Trả thêm ID của booking vừa tạo
        ], 200);
    }


    //--------------------------------------------------end-test--------------------------//
}
