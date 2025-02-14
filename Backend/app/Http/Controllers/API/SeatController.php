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
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPage = request()->input('per_page', 5);

        //Hiển thị tất cả loại ghế
        $seatType = SeatType::paginate($perPage);

        return response()->json(['seat_type' => $seatType], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Xác thực dữ liệu
        $validator = Validator::make($request->all(), [
            '*.room_id' => 'required|exists:rooms,id',
            '*.seat_number' => 'required|unique:seats,seat_number',
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

        // Mảng chứa dữ liệu ghế để chèn vào database
        $seatsToInsert = [];

        foreach ($seatsData as $data) {
            // Chuẩn bị dữ liệu để chèn vào database
            $seatsToInsert[] = [
                'room_id' => $data['room_id'],
                'seat_number' => $data['seat_number'],
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
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
