<?php

namespace App\Http\Controllers\API;

use App\Events\SeatHeldEvent;
use App\Events\SeatUpdated;
use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Seat;
use App\Models\SeatType;
use App\Models\SeatTypePrice;
use App\Models\ShowTime;
use App\Models\ShowTimeSeat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class SeatController extends Controller
{

    //hiển thị ghế theo thời gian thực
    public function getSeatsForBooking($room_id, $show_time_id)
    {
        // Lấy thông tin suất chiếu và ngày suất chiếu từ show_time_id
        $showtime = ShowTime::with('showTimeDate')
            ->find($show_time_id);
        if (!$showtime) {
            return response()->json(['error' => 'Showtime not found'], 404);
        }

        // Lấy ngày suất chiếu từ bảng show_time_date
        $showtimeDateRecord = $showtime->showTimeDate->first();
        if (!$showtimeDateRecord) {
            return response()->json(['error' => 'Showtime date not found'], 404);
        }
        $showtimeDate = $showtimeDateRecord->show_date; // Lấy show_date từ bảng show_time_date

        // Lấy tất cả ghế trong phòng và liên kết với loại ghế
        $seats = Seat::where('room_id', $room_id)
            ->with(['seatType', 'showTimeSeat' => function ($query) use ($show_time_id) {
                $query->where('show_time_id', $show_time_id);
            }])
            ->get();
        $userId = auth()->id();

        // Tạo ma trận ghế ngồi theo hàng và cột
        $seatingMatrix = [];
        foreach ($seats as $seat) {

            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }

            // Lấy status từ bảng show_time_seat
            $showTimeSeat = $seat->showTimeSeat->first();
            $status = $showTimeSeat ? $showTimeSeat->seat_status : 'available';

            // Kiểm tra nếu ghế đang bị giữ trong cache
            $heldSeat = Cache::get("seat_{$show_time_id}_{$seat->id}");
            $isHeld = !empty($heldSeat);
            $heldByUser = $isHeld && $heldSeat['user_id'] == $userId;

            // **Nếu ghế đang bị giữ, cập nhật trạng thái**
            if ($isHeld) {
                $status = 'held';
            }

            // Tạo mã ghế từ hàng và cột
            $seatCode = $seat->row . $seat->column;

            // Lấy giá ghế theo ngày hiện tại
            $price = SeatTypePrice::getPriceByDate($seat->seat_type_id, $showtimeDate) ?? 0;

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

        // Phát sự kiện cập nhật ghế cho tất cả người dùng
        broadcast(new SeatUpdated($room_id, $show_time_id, $seatingMatrix))->toOthers();

        return response()->json(array_values($seatingMatrix));
    }

    //Cập nhật trạng thái ghế theo thời gian thực khi chọn ghế
    public function holdSelectedSeats(Request $request)
    {
        // $request->validate([
        //     'seats' => 'required|array',
        //     'seats.*' => 'exists:seats,id'
        // ]);

        $validator = Validator::make($request->all(), [
            'seats' => 'required|array',
            'seats.*' => 'numeric|exists:seats,id',
            'room_id' => 'required|numeric|exists:rooms,id',
            'showtime_id' => 'required|numeric|exists:show_times,id'
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $seats = $request->input('seats'); // Lấy danh sách ghế dưới dạng mảng
        $roomId = $request->input('room_id');
        $showTimeId = $request->input('showtime_id');
        $userId = auth()->id();
        $expiresAt = now()->addMinutes(7);

        foreach ($request->seats as $seat) {
            // Kiểm tra ghế đã bị giữ chưa
            $cacheKey = "seat_{$showTimeId}_{$seat}";
            $heldSeat = Cache::get("$cacheKey");
            if (!empty($heldSeat) && $heldSeat['user_id'] !== $userId) {
                return response()->json(['message' => 'Ghế đã được giữ bởi người khác!'], 409);
            }

            // Giữ ghế
            Cache::put($cacheKey, ['user_id' => $userId, 'expires_at' => $expiresAt], $expiresAt);
        }

        // Phát sự kiện cập nhật realtime
        broadcast(new SeatHeldEvent(
            $request->seat_ids,
            $userId,
            $roomId,
            $showTimeId,
            'held'
        ))->toOthers();

        return response()->json(['message' => 'Ghế đã được giữ!', 'seats' => $seats, 'expires_at' => $expiresAt, 'user_id' => $userId]);
    }

    /**
     * Giải phóng ghế nếu người dùng không đặt vé sau 5 phút
     */
    public function releaseSeat(Request $request)
    {
        // Xác thực dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'seats' => 'required|array',
            'seats.*' => 'numeric|exists:seats,id',
            'room_id' => 'required|numeric|exists:rooms,id',
            'showtime_id' => 'required|numeric|exists:show_times,id'
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu từ request
        $seats = $request->input('seats');
        $roomId = $request->input('room_id');
        $showTimeId = $request->input('showtime_id');

        // Kiểm tra xem $seats có phải là mảng hợp lệ không
        if (!is_array($seats) || empty($seats)) {
            return response()->json([
                'message' => 'Danh sách ghế không hợp lệ!',
            ], 400);
        }

        $releasedSeats = [];
        $failedSeats = [];

        // Lặp qua từng ghế để xử lý
        foreach ($seats as $seatId) {
            $cacheKey = "seat_{$showTimeId}_{$seatId}";
            if (Cache::has($cacheKey)) {
                Cache::forget($cacheKey);
                $releasedSeats[] = (int)$seatId;
            } else {
                $failedSeats[] = $seatId;
            }

            $cacheKey = "seat_" . (int)$seatId; // Chuyển $seatId thành số nguyên để tránh lỗi

            // Kiểm tra ghế có tồn tại trong cache không
            if (!Cache::has($cacheKey)) {
                $failedSeats[] = $seatId;
                continue;
            }

            // Xóa ghế khỏi Redis
            Cache::forget($cacheKey);
            $releasedSeats[] = (int)$seatId; // Đảm bảo $releasedSeats chỉ chứa số
        }

        // Nếu không có ghế nào được giải phóng, trả về lỗi
        if (empty($releasedSeats)) {
            return response()->json([
                'message' => 'Tất cả ghế chưa được giữ hoặc đã được giải phóng trước đó!',
                'failed_seats' => $failedSeats
            ], 404);
        }

        // Phát sự kiện ghế đã được giải phóng
        broadcast(new SeatHeldEvent(
            $request->seat_ids,
            null,
            $roomId,
            $showTimeId,
            'released'
        ))->toOthers();

        return response()->json([
            'message' => 'Ghế đã được giải phóng!',
            'seats' => $releasedSeats,
            'failed_seats' => $failedSeats
        ]);
    }

    /**
     * Cập nhật trạng thái ghế theo room_id và seat_id cho tất cả suất chiếu
     *
     * @param Request $request
     * @param int $roomId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSeatStatusForRoom(Request $request, $roomId)
    {
        try {
            $status = $request->input('seat_status');
            $seatId = $request->input('seat_id');

            // Kiểm tra input
            if (!$status) {
                return response()->json(['message' => 'Trạng thái ghế (seat_status) là bắt buộc'], 400);
            }
            if (!$seatId || !is_numeric($seatId)) {
                return response()->json(['message' => 'ID ghế (seat_id) là bắt buộc và phải là một số'], 400);
            }
            if (!in_array($status, ['available', 'booked', 'disabled', 'empty'])) {
                return response()->json(['message' => 'Trạng thái ghế không hợp lệ, chỉ chấp nhận "available", "booked", "disabled" hoặc "empty"'], 400);
            }

            // Kiểm tra ghế tồn tại
            $seat = Seat::where('id', $seatId)->where('room_id', $roomId)->first();
            if (!$seat) {
                return response()->json(['message' => "Không tìm thấy ghế ID {$seatId} thuộc phòng ID {$roomId}"], 400);
            }

            // Lấy tất cả suất chiếu trong tương lai liên quan đến phòng
            $currentTime = now();
            $showTimes = ShowTime::join('show_time_date', 'show_time_date.show_time_id', '=', 'show_times.id')
                ->where('show_times.room_id', $roomId)
                ->whereRaw("CONCAT(show_time_date.show_date, ' ', show_times.end_time) >= ?", [$currentTime])
                ->select('show_times.*', 'show_time_date.show_date')
                ->get();

            // Log số lượng suất chiếu tìm thấy
            Log::info("Found {$showTimes->count()} show times for Room ID: {$roomId}");

            // Log chi tiết các suất chiếu tìm thấy
            foreach ($showTimes as $showTime) {
                Log::info("ShowTime found: ShowTime ID: {$showTime->id}, Show Date: {$showTime->show_date}, Start Time: {$showTime->start_time}, End Time: {$showTime->end_time}");
            }

            if ($showTimes->isEmpty()) {
                // Cập nhật trạng thái mặc định cho ghế nếu không có suất chiếu trong tương lai
                $seat->update(['status' => $status]);
                return response()->json(['message' => "Đã cập nhật trạng thái mặc định '{$status}' cho ghế ID {$seatId} vì không có suất chiếu trong tương lai"], 200);
            }

            Log::info("Updating seat status for Seat ID: {$seatId}, Room ID: {$roomId}, New Status: {$status}");
            Log::info("Current Time: {$currentTime}");

            $updatedCount = 0;
            $skippedCount = 0;

            // Duyệt qua từng suất chiếu
            foreach ($showTimes as $showTime) {
                // Kiểm tra xem ghế đã được liên kết với suất chiếu này trong show_time_seat chưa
                $showTimeSeat = ShowTimeSeat::where('seat_id', $seatId)
                    ->where('show_time_id', $showTime->id)
                    ->first();

                // Nếu chưa có bản ghi trong show_time_seat, tạo mới với trạng thái mặc định của ghế
                if (!$showTimeSeat) {
                    $showTimeSeat = ShowTimeSeat::create([
                        'seat_id' => $seatId,
                        'show_time_id' => $showTime->id,
                        'seat_status' => $seat->status ?? 'available', // Lấy trạng thái mặc định từ bảng seats
                    ]);
                    Log::info("Created new ShowTimeSeat: Seat ID: {$seatId}, ShowTime ID: {$showTime->id}, Seat Status: {$showTimeSeat->seat_status}");
                }

                // Kiểm tra trạng thái ghế trực tiếp từ cơ sở dữ liệu
                $seatStatus = ShowTimeSeat::where('id', $showTimeSeat->id)->value('seat_status');
                Log::info("Direct DB check - Seat ID: {$seatId}, ShowTimeSeat ID: {$showTimeSeat->id}, Seat Status: {$seatStatus}");

                // Lấy ngày suất chiếu từ show_time_date
                $showDate = \Carbon\Carbon::parse($showTime->show_date);
                $startDateTime = \Carbon\Carbon::parse($showDate->toDateString() . ' ' . $showTime->start_time);
                $endDateTime = \Carbon\Carbon::parse($showDate->toDateString() . ' ' . $showTime->end_time);

                // Kiểm tra trạng thái suất chiếu
                $isPastShowTime = $endDateTime->isPast();
                $isOngoingShowTime = $startDateTime->lte($currentTime) && $endDateTime->gt($currentTime);
                $isFutureShowTime = $startDateTime->gt($currentTime);

                // Log chi tiết để debug
                Log::info("ShowTime ID: {$showTime->id}, Seat ID: {$seatId}, Seat Status (from object): {$showTimeSeat->seat_status}");
                Log::info("Show Date: {$showDate->toDateString()}, Start Time: {$startDateTime}, End Time: {$endDateTime}");
                Log::info("Is Past: " . ($isPastShowTime ? 'true' : 'false') .
                    ", Is Ongoing: " . ($isOngoingShowTime ? 'true' : 'false') .
                    ", Is Future: " . ($isFutureShowTime ? 'true' : 'false'));

                // Nếu ghế đang booked và suất chiếu chưa kết thúc, bỏ qua suất chiếu này
                if (strtolower($seatStatus) === 'booked' && !$isPastShowTime) {
                    $skippedCount++;
                    Log::info("Skipped update for ShowTime ID: {$showTime->id} - Seat is booked and show is not finished");
                    continue;
                }

                // Cập nhật trạng thái cho các suất chiếu không bị booked hoặc đã kết thúc
                $showTimeSeat->update(['seat_status' => $status]);
                $updatedCount++;
                Log::info("Updated ShowTime ID: {$showTime->id} to status: {$status}");
            }

            // Cập nhật trạng thái mặc định cho ghế (áp dụng cho các suất chiếu mới sau này)
            $seat->update(['status' => $status]);
            Log::info("Updated default seat status to '{$status}' for Seat ID: {$seatId}");

            $responseMessage = "Cập nhật thành công {$updatedCount} suất chiếu cho ghế ID {$seatId} thành '{$status}'";
            if ($skippedCount > 0) {
                $responseMessage .= ". Bỏ qua {$skippedCount} suất chiếu vì ghế đã được đặt và suất chiếu chưa kết thúc";
            }
            $responseMessage .= ". Trạng thái mặc định của ghế đã được cập nhật thành '{$status}' cho các suất chiếu mới.";

            return response()->json(['message' => $responseMessage], 200);
        } catch (\Exception $e) {
            Log::error("Error updating seat status: {$e->getMessage()}");
            return response()->json(['message' => 'Đã xảy ra lỗi khi cập nhật trạng thái ghế', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Cập nhật trạng thái ghế
     */
    public function updateSeatStatus(Request $request)
    {
        // Kiểm tra yêu cầu có chứa 'show_time_id' và 'seats' không
        if (!$request->has('show_time_id') || !$request->has('seats') || !is_array($request->seats)) {
            return response()->json(['error' => 'Thiếu show_time_id hoặc danh sách ghế không hợp lệ'], 400);
        }

        // Lấy show_time_id và danh sách ghế từ yêu cầu
        $show_time_id = $request->show_time_id;
        $seatsData = $request->seats;

        // Kiểm tra suất chiếu có tồn tại không
        $showTime = ShowTime::find($show_time_id);
        if (!$showTime) {
            return response()->json(['error' => 'Suất chiếu không tồn tại'], 404);
        }

        // Mảng lưu thông báo về ghế đã được cập nhật
        $updatedSeats = [];

        // Duyệt qua tất cả ghế để cập nhật trạng thái
        foreach ($seatsData as $seatData) {
            // Kiểm tra nếu thiếu seat_id hoặc seat_status
            if (!isset($seatData['seat_id']) || !isset($seatData['seat_status'])) {
                return response()->json(['error' => 'Mỗi ghế cần có seat_id và seat_status'], 400);
            }

            $seat_id = $seatData['seat_id'];
            $seat_status = $seatData['seat_status'];

            // Kiểm tra trạng thái ghế hợp lệ
            if (!in_array($seat_status, ['available', 'booked'])) {
                return response()->json(['error' => 'Trạng thái ghế không hợp lệ'], 400);
            }

            // Tìm ghế theo seat_id
            $seat = Seat::find($seat_id);
            if (!$seat) {
                return response()->json(['error' => 'Ghế không tồn tại'], 404);
            }

            // Tìm bản ghi trong bảng show_time_seats
            $showTimeSeat = ShowTimeSeat::where('show_time_id', $show_time_id)
                ->where('seat_id', $seat_id)
                ->first();

            if (!$showTimeSeat) {
                return response()->json(['error' => 'Ghế không thuộc suất chiếu này'], 404);
            }

            // Cập nhật trạng thái ghế
            $showTimeSeat->seat_status = $seat_status;
            $showTimeSeat->save();

            // Thêm ghế vào mảng đã cập nhật
            $updatedSeats[] = [
                'seat_id' => $seat_id,
                'seat_status' => $seat_status
            ];
        }

        return response()->json([
            'message' => 'Cập nhật trạng thái ghế thành công',
            'updated_seats' => $updatedSeats
        ], 200);
    }
    /**
     * Lấy ghế theo id phòng
     */

    public function getSeats($room_id)
    {
        // Lấy lịch chiếu gần nhất của phòng (có thể điều chỉnh để lấy lịch chiếu cụ thể)
        $currentDateTime = now();
        $currentDate = $currentDateTime->toDateString();
        $currentTime = $currentDateTime->toTimeString();

        $latestShowTime = ShowTime::join('show_time_date', 'show_time_date.show_time_id', '=', 'show_times.id')
            ->where('show_times.room_id', $room_id)
            ->whereRaw("CONCAT(show_time_date.show_date, ' ', show_times.start_time) >= ?", [$currentDateTime])
            ->orderByRaw("CONCAT(show_time_date.show_date, ' ', show_times.start_time) ASC")
            ->select('show_times.id')
            ->first();

        if (!$latestShowTime) {
            return response()->json([
                'message' => 'Không có lịch chiếu nào cho phòng này trong tương lai',
                'seatingMatrix' => []
            ], 200);
        }

        // Lấy tất cả ghế trong phòng
        $seats = Seat::where('room_id', $room_id)
            ->with([
                'seatType',
                'showTimeSeat' => function ($query) use ($latestShowTime) {
                    $query->where('show_time_id', $latestShowTime->id);
                }
            ])
            ->get();

        // Tạo ma trận ghế ngồi theo hàng và cột
        $seatingMatrix = [];
        foreach ($seats as $seat) {
            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }

            // Tạo mã ghế từ hàng và cột
            $seatCode = $seat->row . $seat->column;

            // Lấy giá ghế theo ngày hiện tại
            $price = SeatTypePrice::getPriceByDate($seat->seat_type_id, $currentDate) ?? 0;

            // Lấy trạng thái ghế từ bảng show_time_seats cho lịch chiếu gần nhất
            $seatStatus = optional($seat->showTimeSeat)->first()->seat_status ?? 'available';

            // Gán thông tin ghế vào ma trận
            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode,
                'type' => $seat->seatType->name, // Lấy từ mối quan hệ seatType
                'status' => $seatStatus, // Trạng thái lấy từ show_time_seats
                'price' => $price,
            ];
        }

        return response()->json($seatingMatrix);
    }


    private function getSeatTypeByRow($row)
    {

        //gán loại ghế dựa theo hàng
        if (in_array($row, ['A', 'B', 'C'])) {
            return SeatType::where('name', 'Thường')->first();
        } elseif (in_array($row, ['D', 'E', 'F', 'G', 'H'])) {
            return SeatType::where('name', 'VIP')->first();
        } elseif ($row === 'J') {
            return SeatType::where('name', 'Sweetbox')->first();
        } else {
            return SeatType::where('name', 'Thường')->first();  // Mặc định là loại ghế Thường
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Xác thực dữ liệu
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'row' => 'required|max:20',
            'column' => 'required|max:10',
            'seat_type_id' => 'required|exists:seat_types,id',
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra ghế có tồn tại trong phòng chưa
        $existingSeat = Seat::where('room_id', $request->room_id)
            ->where('row', $request->row)
            ->where('column', $request->column)
            ->first();

        if ($existingSeat) {
            return response()->json(['message' => 'Ghế đã tồn tại'], 400);
        }

        //Lấy dữ liệu 
        $data = $request->all();

        // Tạo ghế mới
        $seat = Seat::query()->create($data);

        // Cập nhật capacity của phòng
        $room = Room::find($seat->room_id);
        if ($room) {
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();
        }

        // Trả về phản hồi thành công
        return response()->json(['message' => 'Thêm ghế thành công', 'data' => $seat], 201);
    }

    public function destroy($seat)
    {
        $seat = Seat::findOrFail($seat);
        $roomId = $seat->room_id;
        $seat->delete();

        // Cập nhật capacity của phòng
        $room = Room::find($roomId);
        if ($room) {
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();
        }
        return response()->json(['message' => 'Ghế đã được xóa thành công'], 200);
    }

    public function deleteAll($room_id)
    {
        $seats = Seat::where('room_id', $room_id)->get();
        foreach ($seats as $seat) {
            $seat->delete(); // Xóa mềm hoặc xóa vĩnh viễn tùy cấu hình
        }
        return response()->json(['message' => 'Đã xóa tất cả ghế trong phòng thành công'], 200);
    }


    public function update($seatId, Request $request)
    {
        $seat = Seat::findOrFail($seatId);

        // Xác thực dữ liệu
        $validator = Validator::make($request->all(), [
            'row' => 'sometimes|max:20',
            'column' => 'sometimes|max:10',
            'seat_type_id' => 'sometimes|exists:seat_types,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Cập nhật các trường được gửi
        $seat->update($request->only(['row', 'column', 'seat_type_id']));

        return response()->json(['message' => 'Cập nhật ghế thành công', 'data' => $seat->load('seatType')], 200);
    }
}
