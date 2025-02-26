<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CalendarShow;
use App\Models\ShowTime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class ShowTimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $showTime = ShowTime::query()->latest('id')->with(['calendarShow.movie','calendarShow', 'room'])->get();

        return response()->json($showTime, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'status' => 'required|in:referenced,now_showing,coming_soon',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Thêm lịch chiếu
        $showTime = ShowTime::create([
            'calendar_show_id' => $request->calendar_show_id,
            'room_id' => $request->room_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Xuất chiếu đã được thêm thành công', 'data' => $showTime], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $showTime = ShowTime::with(['calendarShow.movie','calendarShow', 'room'])->find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Xuất chiếu không tồn tại'], 404);
        }

        return response()->json($showTime);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'required|in:referenced,now_showing,coming_soon',
        ]);

        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $showTime->update($validated);

        return response()->json([
            'message' => 'Cập nhật xuất chiếu thành công',
            'data' => $showTime
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $showTime->delete();

        return response()->json([
            'message' => 'Xuất chiếu đã được gỡ'
        ]);
    }

//------------------------------------showTime-------------------------------------------------
    public function filterByDateOne(Request $request)
{
    // Validate ngày chiếu được truyền vào
    $validator = Validator::make($request->all(), [
        'show_date' => 'required|date',  // Ngày phải đúng định dạng
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => $validator->errors()], 422);
    }

    // Lọc các lịch chiếu theo ngày
    $calendarShows = CalendarShow::where('show_date', $request->show_date)->get();

    if ($calendarShows->isEmpty()) {
        return response()->json(['message' => 'Không có lịch chiếu nào cho ngày này'], 404);
    }

    // Lọc các showTime dựa trên các calendarShow
    $showTimes = ShowTime::whereIn('calendar_show_id', $calendarShows->pluck('id'))
    ->with(['calendarShow.movie', 'calendarShow', 'room']) // Eager load movie từ calendarShow
    ->get();

    return response()->json($showTimes, 200);
}


//------------------------------------showTime-------------------------------------------------//

// public function filterByDate(Request $request)
// {
//     // Validate ngày chiếu được truyền vào
//     $validator = Validator::make($request->all(), [
//         'show_date' => 'required|date',  // Ngày bắt đầu phải đúng định dạng
//         'end_date' => 'required|date|after_or_equal:show_date', // Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['error' => $validator->errors()], 422);
//     }

//     $show_date = $request->show_date;
//     $end_date = $request->end_date;

//     // Lọc các calendarShow theo khoảng thời gian (show_date và end_date)
//     $calendarShows = CalendarShow::where(function($query) use ($show_date, $end_date) {
//         // Lọc những CalendarShow có show_date trong khoảng thời gian yêu cầu
//         $query->whereBetween('show_date', [$show_date, $end_date])
//               ->orWhereBetween('end_date', [$show_date, $end_date])
//               ->orWhere(function($query) use ($show_date, $end_date) {
//                   // Lọc những CalendarShow mà khoảng thời gian (show_date, end_date) bao gồm toàn bộ khoảng thời gian yêu cầu
//                   $query->where('show_date', '<=', $show_date)
//                         ->where('end_date', '>=', $end_date);
//               });
//     })->get();

//     if ($calendarShows->isEmpty()) {
//         return response()->json(['message' => 'Không có lịch chiếu nào trong khoảng thời gian này'], 404);
//     }

//     // Lọc các showTime dựa trên các calendarShow
//     $showTimes = ShowTime::whereIn('calendar_show_id', $calendarShows->pluck('id'))
//                          ->with(['calendarShow.movie', 'calendarShow', 'room']) // Eager load movie từ calendarShow
//                          ->get();

//     return response()->json($showTimes, 200);
// }

//------------------------------------showTime-------------------------------------------------//


// public function filterByDate(Request $request)
// {
//     // Validate ngày chiếu được truyền vào
//     $validator = Validator::make($request->all(), [
//         'show_date' => 'required|date',  // Ngày bắt đầu phải đúng định dạng
//         'end_date' => 'required|date|after_or_equal:show_date', // Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['error' => $validator->errors()], 422);
//     }

//     $show_date = $request->show_date;
//     $end_date = $request->end_date;

//     // Tạo một mảng chứa tất cả các ngày trong khoảng từ show_date đến end_date
//     $dates = [];
//     $currentDate = Carbon::parse($show_date);

//     while ($currentDate <= Carbon::parse($end_date)) {
//         $dates[] = $currentDate->toDateString(); // Thêm ngày vào mảng dưới dạng YYYY-MM-DD
//         $currentDate->addDay(); // Tăng 1 ngày
//     }

//     // Lọc các showTimes cho từng ngày trong mảng dates
//     $showTimesByDate = [];

//     foreach ($dates as $date) {
//         // Lọc các CalendarShow mà show_date hoặc end_date nằm trong ngày $date
//         $calendarShows = CalendarShow::where(function($query) use ($date) {
//             $query->where('show_date', '<=', $date)
//                   ->where('end_date', '>=', $date);
//         })->get();

//         if ($calendarShows->isEmpty()) {
//             continue; // Nếu không có lịch chiếu cho ngày này, bỏ qua
//         }

//         // Lọc các showTimes cho các CalendarShows này
//         $showTimes = ShowTime::whereIn('calendar_show_id', $calendarShows->pluck('id'))
//                              ->with(['calendarShow.movie', 'calendarShow', 'room']) // Eager load movie, calendarShow và room
//                              ->get();

//         if ($showTimes->isNotEmpty()) {
//             // Thêm các showTime của ngày $date vào mảng kết quả
//             $showTimesByDate[$date] = $showTimes;
//         }
//     }

//     // Trả về kết quả dưới dạng JSON
//     return response()->json($showTimesByDate, 200);
// }

//------------------------------------showTime-------------------------------------------------//

//hàm hiển thị khoảng ngày giữa show_date và end_date

public function generateDateRange($startDate, $endDate)
{
    // Tạo một mảng chứa tất cả các ngày trong khoảng từ show_date đến end_date
    $dates = [];
    $currentDate = Carbon::parse($startDate);

    // Duyệt qua tất cả các ngày trong khoảng
    while ($currentDate <= Carbon::parse($endDate)) {
        $dates[] = $currentDate->toDateString(); // Thêm ngày vào mảng dưới dạng YYYY-MM-DD
        $currentDate->addDay(); // Tăng 1 ngày
    }

    return $dates;
}


//hàm lọc theo lịch chiếu

public function filterByDate(Request $request)
{
    // Validate ngày chiếu được truyền vào
    $validator = Validator::make($request->all(), [
        'show_date' => 'required|date',  // Ngày bắt đầu phải đúng định dạng
        'end_date' => 'required|date|after_or_equal:show_date', // Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu
    ]);

    if ($validator->fails()) {
        return response()->json(['error' => $validator->errors()], 422);
    }

    $show_date = $request->show_date;
    $end_date = $request->end_date;

    // Gọi hàm generateDateRange để lấy danh sách các ngày trong khoảng
    $dates = $this->generateDateRange($show_date, $end_date);

    // Lọc các showTimes cho từng ngày trong mảng dates
    $showTimesByDate = [];

    foreach ($dates as $date) {
        // Lọc các CalendarShow mà show_date hoặc end_date nằm trong ngày $date
        $calendarShows = CalendarShow::where(function($query) use ($date) {
            $query->where('show_date', '<=', $date)
                  ->where('end_date', '>=', $date);
        })->get();

        if ($calendarShows->isEmpty()) {
            continue; // Nếu không có lịch chiếu cho ngày này, bỏ qua
        }

        // Lọc các showTimes cho các CalendarShows này
        $showTimes = ShowTime::whereIn('calendar_show_id', $calendarShows->pluck('id'))
                             ->with(['calendarShow.movie', 'calendarShow', 'room']) // Eager load movie, calendarShow và room
                             ->get();

        if ($showTimes->isNotEmpty()) {
            // Thêm các showTime của ngày $date vào mảng kết quả
            $showTimesByDate[$date] = $showTimes;
        }
    }

    // Trả về kết quả dưới dạng JSON
    return response()->json($showTimesByDate, 200);
}




}
