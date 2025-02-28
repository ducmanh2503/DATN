<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CalendarShow;
use App\Models\ShowTime;
use App\Models\ShowTimeDate;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;


class ShowTimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $showTime = ShowTime::query()->latest('id')->with(['calendarShow.movie', 'calendarShow', 'room'])->get();

        return response()->json($showTime, 200);
    }


    //---------------------------------test--------------------------------//

    public function getDateRangeByCalendarShow(Request $request)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $validator = Validator::make($request->all(), [
            'calendar_show_id' => 'required|exists:calendar_show,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $calendarShow = CalendarShow::find($request->calendar_show_id);
        $dates = $this->generateDateRange($calendarShow->show_date, $calendarShow->end_date);

        return response()->json([
            'calendar_show' => $calendarShow,
            'dates' => $dates
        ], 200);
    }

    //---------------------------------end-test--------------------------------//

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'status' => 'required|in:referenced,now_showing,coming_soon',
            'selected_date' => 'required|date', // Thêm trường này để chọn một ngày cụ thể
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra xem ngày được chọn có nằm trong khoảng show_date và end_date không
        $calendarShow = CalendarShow::find($request->calendar_show_id);
        $selectedDate = Carbon::parse($request->selected_date);
        $showDate = Carbon::parse($calendarShow->show_date);
        $endDate = Carbon::parse($calendarShow->end_date);

        if ($selectedDate->lt($showDate) || $selectedDate->gt($endDate)) {
            return response()->json([
                'error' => 'Ngày đã chọn không nằm trong khoảng của lịch chiếu'
            ], 422);
        }

        // Kiểm tra xem phòng chiếu có trống vào thời điểm này không
        $conflictingShowTimes = ShowTime::whereHas('showTimeDate', function ($query) use ($request) {
            $query->whereDate('show_date', $request->selected_date);
        })
            ->where('room_id', $request->room_id)
            ->where(function ($query) use ($request) {
                // Kiểm tra xung đột thời gian
                $query->where(function ($q) use ($request) {
                    $q->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                });
            })
            ->count();

        if ($conflictingShowTimes > 0) {
            return response()->json([
                'error' => 'Phòng chiếu đã được đặt trong khoảng thời gian này'
            ], 422);
        }

        // Thêm lịch chiếu
        $showTime = ShowTime::create([
            'calendar_show_id' => $request->calendar_show_id,
            'room_id' => $request->room_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->status,
        ]);

        // Tạo bản ghi trong bảng show_time_date
        $showTimeDate = ShowTimeDate::create([
            'show_time_id' => $showTime->id,
            'show_date' => $request->selected_date
        ]);

        return response()->json([
            'message' => 'Xuất chiếu đã được thêm thành công',
            'data' => [
                'show_time' => $showTime,
                'show_date' => $showTimeDate
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $showTime = ShowTime::with(['calendarShow.movie', 'calendarShow', 'room'])->find($id);

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

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Bước 1: Xác thực dữ liệu đầu vào
        $validated = $request->validate([
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:H:i',  // Kiểu thời gian theo format H:i
            'end_time' => 'required|date_format:H:i',    // Kiểu thời gian theo format H:i
            'status' => 'required|in:referenced,now_showing,coming_soon',
        ]);

        // Bước 2: Tìm bản ghi ShowTime theo id
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        // Bước 3: Kiểm tra xem ngày chiếu có nằm trong khoảng show_date và end_date không (tuỳ chọn)
        $calendarShow = CalendarShow::find($validated['calendar_show_id']);
        $showDate = Carbon::parse($calendarShow->show_date);
        $endDate = Carbon::parse($calendarShow->end_date);
        $selectedDate = Carbon::parse($request->input('selected_date'));

        if ($selectedDate->lt($showDate) || $selectedDate->gt($endDate)) {
            return response()->json(['error' => 'Ngày chiếu không hợp lệ'], 422);
        }

        // Bước 4: Kiểm tra xem phòng chiếu có bị trùng lịch không (có thể thay đổi điều kiện tùy theo yêu cầu)
        $conflictingShowTimes = ShowTime::where('room_id', $validated['room_id'])
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                    ->where('end_time', '>', $validated['start_time']);
            })
            ->whereHas('showTimeDate', function ($query) use ($selectedDate) {
                $query->whereDate('show_date', $selectedDate);
            })
            ->count();

        if ($conflictingShowTimes > 0) {
            return response()->json(['error' => 'Phòng chiếu đã có suất chiếu trùng giờ'], 422);
        }

        // Bước 5: Cập nhật thông tin ShowTime
        $showTime->calendar_show_id = $validated['calendar_show_id'];
        $showTime->room_id = $validated['room_id'];
        $showTime->start_time = $validated['start_time'];
        $showTime->end_time = $validated['end_time'];
        $showTime->status = $validated['status'];

        // Bước 6: Lưu lại thay đổi
        try {
            $showTime->save();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Cập nhật thất bại: ' . $e->getMessage()], 500);
        }

        // Bước 7: Trả về kết quả thành công
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

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $showTime->delete();

        return response()->json([
            'message' => 'Xuất chiếu đã được gỡ'
        ]);
    }

    public function destroyByDate(string $id, string $selected_date)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Tìm suất chiếu theo ID
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        // Tìm bản ghi ShowTimeDate theo ngày chiếu đã chọn
        $showTimeDate = $showTime->showTimeDate()->where('show_date', $selected_date)->first();

        if (!$showTimeDate) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu vào ngày này'], 404);
        }

        // Xóa bản ghi ShowTimeDate cho ngày đã chọn
        $showTimeDate->delete();

        return response()->json([
            'message' => 'Xuất chiếu vào ngày ' . $selected_date . ' đã được gỡ'
        ]);
    }


    //------------------------------------showTime-------------------------------------------------
    public function getShowTimesByDate(Request $request)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'room_id' => 'nullable|exists:rooms,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy tất cả show_time_id có trong ngày đã chọn
        $showTimeIds = ShowTimeDate::where('show_date', $request->date)
            ->pluck('show_time_id');

        if ($showTimeIds->isEmpty()) {
            return response()->json(['message' => 'Không có suất chiếu nào cho ngày này'], 404);
        }

        // Query các ShowTime
        $query = ShowTime::whereIn('id', $showTimeIds)
            ->with(['calendarShow.movie', 'calendarShow', 'room']);

        // Thêm điều kiện lọc theo phòng nếu có
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        $showTimes = $query->get();

        return response()->json($showTimes, 200);
    }

    //hàm hiển thị khoảng ngày giữa show_date và end_date

    public function generateDateRange($startDate, $endDate)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

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

    /**
     * Hiển thị tất cả suất chiếu trong khoảng ngày từ bảng calendar_show
     */
    public function getShowTimesInDateRange(Request $request)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Validate dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'show_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:show_date',
            'room_id' => 'nullable|exists:rooms,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $showDate = $request->show_date;
        $endDate = $request->end_date;

        // Tìm tất cả calendar_show có ngày chiếu trong khoảng
        $calendarShows = CalendarShow::where(function ($query) use ($showDate, $endDate) {
            // Trường hợp 1: show_date nằm trong khoảng từ start_date đến end_date
            $query->whereBetween('show_date', [$showDate, $endDate]);
            // HOẶC Trường hợp 2: end_date nằm trong khoảng từ start_date đến end_date
            $query->orWhereBetween('end_date', [$showDate, $endDate]);
            // HOẶC Trường hợp 3: khoảng thời gian của calendar_show bao trùm khoảng thời gian tìm kiếm
            $query->orWhere(function ($q) use ($showDate, $endDate) {
                $q->where('show_date', '<=', $showDate)
                    ->where('end_date', '>=', $endDate);
            });
        })->get();

        if ($calendarShows->isEmpty()) {
            return response()->json(['message' => 'Không có lịch chiếu nào trong khoảng ngày này'], 404);
        }

        // Lấy tất cả suất chiếu thuộc các calendar_show tìm được
        $query = ShowTime::whereIn('calendar_show_id', $calendarShows->pluck('id'))
            ->with(['calendarShow.movie', 'calendarShow', 'room', 'showTimeDate']);

        // Thêm điều kiện lọc theo phòng nếu có
        if ($request->has('room_id')) {
            $query->where('room_id', $request->room_id);
        }

        $showTimes = $query->get();

        // Lọc chỉ những suất chiếu có showTimeDate trong khoảng ngày
        $filteredShowTimes = $showTimes->filter(function ($showTime) use ($showDate, $endDate) {
            foreach ($showTime->showTimeDate as $date) {
                if ($date->show_date >= $showDate && $date->show_date <= $endDate) {
                    return true;
                }
            }
            return false;
        });

        if ($filteredShowTimes->isEmpty()) {
            return response()->json(['message' => 'Không có suất chiếu nào được đặt trong khoảng ngày này'], 404);
        }

        return response()->json($filteredShowTimes->values(), 200);
    }
}
