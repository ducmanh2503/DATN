<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Seat;
use App\Models\SeatType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeatController extends Controller
{
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

    public function getSeats(Request $request, $room_id)
    {
        // Lấy tất cả ghế trong phòng cụ thể
        $seats = Seat::where('room_id', $room_id)->with('seatType')->get();

        // Tạo ma trận ghế ngồi theo hàng và cột
        $seatingMatrix = [];
        foreach ($seats as $seat) {
            // Kiểm tra nếu chưa có hàng này trong ma trận, tạo mới hàng
            if (!isset($seatingMatrix[$seat->row])) {
                $seatingMatrix[$seat->row] = [];
            }

            // Xác định loại ghế dựa trên hàng
            $seatType = $this->getSeatTypeByRow($seat->row);

            // Gán lại loại ghế cho ghế
            $seat->seat_type_id = $seatType->id;

            // Tạo mã ghế từ hàng và cột
            $seatCode = $seat->row . $seat->column; //Ví dụ: A1, A2, A3, ...

            // Thêm ghế vào ma trận của hàng và cột
            $seatingMatrix[$seat->row][$seat->column] = [
                'id' => $seat->id,
                'seatCode' => $seatCode, //Mã ghế
                'type' => $seatType->name, //Loại ghế
                'status' => $seat->seat_status, //Trạng thái ghế (available, booked, ...)
                'price' => $seat->getPriceAttribute(), //Giá ghế
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
            '*.room_id' => 'required|exists:rooms,id',
            '*.row' => 'required|max:20',
            '*.column' => 'required|max:10',
            '*.seat_type_id' => 'required|exists:seat_types,id',
            '*.seat_status' => 'required|in:available,booked',
        ]);

        // Kiểm tra nếu có lỗi xác thực
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy danh sách ghế hợp lệ
        $seatsData = $request->all();

        // Nếu chỉ có 1 ghế, đảm bảo dữ liệu là mảng của mảng
        if (!isset($seatsData[0])) {
            $seatsData = [$seatsData];
        }

        // Kiểm tra dữ liệu ghế có đúng kiểu mảng không
        if (!is_array($seatsData)) {
            return response()->json(['error' => 'Dữ liệu không đúng định dạng'], 400);
        }

        //Kiểm tra duy nhất của ghế trong phòng (room_id, row, column)
        foreach ($seatsData as $data) {
            $existingSeat = Seat::where('room_id', $data['room_id'])
                ->where('row', $data['row'])
                ->where('column', $data['column'])
                ->first();

            if ($existingSeat) {
                return response()->json(['message' => 'Ghế đã tồn tại'], 400);
            }
        }

        // Mảng chứa dữ liệu ghế để chèn vào database
        $seatsToInsert = [];
        foreach ($seatsData as $data) {
            // Chuẩn bị dữ liệu để chèn vào database
            $seatsToInsert[] = [
                'room_id' => $data['room_id'],
                'row' => $data['row'],
                'column' => $data['column'],
                'seat_type_id' => $data['seat_type_id'],
                'seat_status' => $data['seat_status'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Thêm ghế vào database
        Seat::insert($seatsToInsert);

        // Trả về kết quả thành công
        return response()->json(['message' => 'Thêm ghế thành công', 'data' => $seatsToInsert], 201);
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
}
