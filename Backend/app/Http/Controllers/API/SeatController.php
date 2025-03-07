<?php

namespace App\Http\Controllers\API;

use App\Events\SeatHeldEvent;
use App\Http\Controllers\Controller;
use App\Models\Seat;
use App\Models\SeatType;
use App\Models\SeatTypePrice;
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
        // Lấy tất cả ghế trong phòng và liên kết với loại ghế
        $seats = Seat::where('room_id', $room_id)
            ->with(['seatType', 'showTimeSeat' => function ($query) use ($show_time_id) {
                $query->where('show_time_id', $show_time_id);
            }])
            ->get();
        $userId = auth()->id();
        $currentDate = now()->toDateString();

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
            $heldSeat = Cache::get("seat_$seat->id");
            $isHeld = !empty($heldSeat);
            $heldByUser = $isHeld && $heldSeat['user_id'] == $userId;

            // Tạo mã ghế từ hàng và cột
            $seatCode = $seat->row . $seat->column;

            // Lấy giá ghế theo ngày hiện tại
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

        return response()->json($seatingMatrix);
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
            'seats.*' => 'exists:seats,id',
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $seats = $request->all();

        $userId = auth()->id();
        $expiresAt = now()->addMinutes(5);

        foreach ($request->seats as $seat) {
            // Kiểm tra ghế đã bị giữ chưa
            $heldSeat = Cache::get("seat_$seat");
            if (!empty($heldSeat) && $heldSeat['user_id'] !== $userId) {
                return response()->json(['message' => 'Ghế đã được giữ bởi người khác!'], 409);
            }

            // Giữ ghế
            Cache::put("seat_$seat", ['user_id' => $userId, 'expires_at' => $expiresAt], $expiresAt);
        }

        // Phát sự kiện cập nhật realtime
        event(new SeatHeldEvent($seats, $userId));

        return response()->json(['message' => 'Ghế đã được giữ!']);
    }

    /**
     * Giải phóng ghế nếu người dùng không đặt vé sau 5 phút
     */
    public function releaseSeat(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seat' => 'required|string|exists:seats,id'
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $seat = $request->input('seat');

        // Kiểm tra ghế có tồn tại trong cache không
        if (!Cache::has("seat_$seat")) {
            return response()->json(['message' => 'Ghế chưa được giữ hoặc đã được giải phóng trước đó!'], 404);
        }

        // Xóa ghế khỏi Redis
        Cache::forget("seat_$seat");

        // Phát sự kiện giải phóng ghế
        broadcast(new SeatHeldEvent($seat, null));

        return response()->json([
            'message' => 'Ghế đã được giải phóng!',
            'seat' => $seat
        ]);
    }

    /**
     * Cập nhật trạng thái ghế
     */
    public function updateSeatStatus(Request $request)
    {

        // Kiểm tra yêu cầu có chứa 'seats' không (danh sách ghế)
        if (!$request->has('seats') || !is_array($request->seats)) {
            return response()->json(['error' => 'Thiếu thông tin ghế hoặc dữ liệu ghế không hợp lệ'], 400);
        }

        // Lấy danh sách ghế và trạng thái từ yêu cầu
        $seatsData = $request->seats;

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

            // Tìm ghế theo seat_id
            $seat = Seat::find($seat_id);

            // Kiểm tra nếu không tìm thấy ghế
            if (!$seat) {
                return response()->json(['error' => 'Ghế không tồn tại'], 404);
            }

            // Cập nhật trạng thái ghế
            $seat->seat_status = $seat_status;
            $seat->save();

            // Thêm ghế vào mảng đã cập nhật
            $updatedSeats[] = [
                'seat_id' => $seat_id,
                'seat_status' => $seat_status
            ];
        }

        // Trả về kết quả thành công
        return response()->json([
            'message' => 'Chuyển trạng thái ghế thành công',
            'updated_seats' => $updatedSeats
        ], 200);
    }
    /**
     * Lấy ghế theo id phòng và cập nhật trạng thái ghế
     */

    public function getSeats($room_id)
    {

        // Lấy tất cả ghế trong phòng cụ thể
        $seats = Seat::where('room_id', $room_id)->with('seatType')->get();
        $currentDate = now()->toDateString();


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

            // Sử dụng loại ghế thực tế từ seatType thay vì gán lại
            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode,
                'type' => $seat->seatType->name, // Lấy từ mối quan hệ seatType
                'status' => $seat->seat_status,
                'price' => $seat->getPriceAttribute(),
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
            'seat_status' => 'required|in:available,booked',
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

        // Trả về phản hồi thành công
        return response()->json(['message' => 'Thêm ghế thành công', 'data' => $seat], 201);
    }

    public function destroy($seat)
    {
        $seat = Seat::findOrFail($seat);
        $seat->delete();
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
            'seat_status' => 'sometimes|in:available,booked',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Cập nhật các trường được gửi
        $seat->update($request->only(['row', 'column', 'seat_type_id', 'seat_status']));

        return response()->json(['message' => 'Cập nhật ghế thành công', 'data' => $seat->load('seatType')], 200);
    }

    /**
     * Lấy tất cả ghế ngồi trong phòng cụ thể (Trang booking)
     */
    // public function getSeats($roomId)
    // {
    //     // Lấy tất cả ghế ngồi trong phòng cụ thể
    //     $seats = Seat::where('room_id', $roomId)
    //         ->with('seatType')  // Kết nối với bảng `seat_types` để lấy thông tin loại ghế
    //         ->get();

    //     // Tạo ma trận ghế ngồi theo row và column
    //     $seatingMatrix = [];
    //     foreach ($seats as $seat) {
    //         // Kiểm tra nếu chưa có row này trong ma trận, tạo mới
    //         if (!isset($seatingMatrix[$seat->row])) {
    //             $seatingMatrix[$seat->row] = [];
    //         }

    //         // Thêm ghế vào ma trận của row và column
    //         $seatingMatrix[$seat->row][$seat->column] = [
    //             'id' => $seat->id,
    //             'type' => $seat->seatType->name,  // Loại ghế
    //             'status' => $seat->seat_status,  // Trạng thái ghế (available, booked, etc.)
    //             'price' => $seat->getPriceAttribute(),  // Giá ghế
    //         ];
    //     }

    //     return response()->json($seatingMatrix);
    // }

    /**
     * Giữ ghế
     */
    // public function holdSeat(Request $request)
    // {
    //     $seat = $request->seat;
    //     $userId = auth()->id();

    //     // Lấy danh sách ghế đang giữ từ cache
    //     $heldSeats = Cache::get('held_seats', []);

    //     // Kiểm tra ghế đã bị giữ chưa
    //     if (isset($heldSeats[$seat]) && $heldSeats[$seat]['user_id'] !== $userId) {
    //         return response()->json(['message' => 'Ghế đã được giữ bởi người khác!'], 409);
    //     }


    //     // Giữ ghế trong 5 phút
    //     $expiresAt = now()->addMinutes(5);
    //     Cache::put("seat_$seat", ['user_id' => $userId, 'expires_at' => $expiresAt], $expiresAt);

    //     // Lưu danh sách ghế đang giữ
    //     $heldSeats = Cache::get('held_seats', []);
    //     $heldSeats[$seat] = ['user_id' => $userId, 'expires_at' => $expiresAt];
    //     Cache::put('held_seats', $heldSeats, $expiresAt);

    //     // Phát sự kiện giữ ghế
    //     broadcast(new SeatHeldEvent($seat, $userId));

    //     return response()->json([
    //         'message' => 'Ghế đã được giữ thành công!',
    //         'seat' => $seat,
    //         'expires_at' => $expiresAt,
    //     ]);
    // }
}
