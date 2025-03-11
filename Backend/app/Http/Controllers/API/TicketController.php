<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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

class TicketController extends Controller
{
    public function getTicketDetails(Request $request)
    {
        // Validate 
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'showtime_id' => 'required|exists:show_times,id',
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
            'combo_ids' => 'nullable|array',
            'combo_ids.*' => 'exists:combos,id',
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

        // Tính tổng giá vé và combo
        $totalTicketPrice = $seats->sum(function ($seat) use ($showTime) {
            return $showTime->room->roomType->price; // Giá vé dựa trên loại phòng
        });
        $totalComboPrice = $combos->sum('price');
        $totalPrice = $totalTicketPrice + $totalComboPrice;

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
                'total_ticket_price' => $totalTicketPrice,
                'total_combo_price' => $totalComboPrice,
                'total_price' => $totalPrice,
            ],
        ];

        // Trả về response
        return response()->json([
            'success' => true,
            'data' => $ticketDetails,
        ], 200);
    }





    //-----------------------test--------------------//

    // public function getTicketDetails(Request $request)
    // {
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
    //     ]);

    //     // Lấy thông tin phim
    //     $movie = Movie::where('id', $request->movie_id)
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

    //     // Lấy giá từ FE
    //     $pricing = $request->pricing;

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
    //     ];

    //     // Trả về response
    //     return response()->json([
    //         'success' => true,
    //         'data' => $ticketDetails,
    //     ], 200);
    // }
}
