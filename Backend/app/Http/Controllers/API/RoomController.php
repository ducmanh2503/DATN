<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Seat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Lấy danh sách phòng và phân trang
        $rooms = Room::query()->latest('id')->get();

        // Trả về phản hồi dạng JSON với cấu trúc dữ liệu phân trang đầy đủ
        return response()->json([
            'message' => 'Danh sách phòng',
            'rooms' => $rooms,
        ], 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {


        try {
            // Lấy dữ liệu JSON từ request
            $data = $request->json()->all();

            // Kiểm tra dữ liệu nhập vào
            $validator = Validator::make($data, [
                'name' => 'required|unique:rooms,name',
                'room_type_id' => 'required|exists:room_types,id'
            ]);

            // Nếu có lỗi validate, trả về lỗi
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            // Tạo phòng mới trong database
            $room = Room::create([
                'name' => $data['name'],
                'room_type_id' => $data['room_type_id'],
                'capacity' => 0 // Gán mặc định là 0, sẽ cập nhật sau
            ]);

            // Tính capacity dựa trên số ghế liên kết với room_id
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();

            // Trả về kết quả thành công
            return response()->json([
                'message' => 'Thêm phòng thành công',
                'room' => $room
            ], 201);
        } catch (\Exception $e) {
            // Nếu có lỗi, trả về thông tin lỗi (để debug)
            return response()->json([
                'error' => 'Đã xảy ra lỗi trong quá trình xử lý.',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {


        $room = Room::find($id);

        // Nếu không tìm thấy phòng
        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng'], 404);
        }
        return response()->json($room);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {


        try {
            // Tìm phòng theo id
            $room = Room::find($id);

            // Nếu không tìm thấy phòng
            if (!$room) {
                return response()->json(['message' => 'Không tìm thấy phòng'], 404);
            }

            // Lấy dữ liệu JSON từ request
            $data = $request->json()->all();

            // Kiểm tra dữ liệu nhập vào
            $validator = Validator::make($data, [
                'name' => 'required|unique:rooms,name,' . $id,
                'room_type_id' => 'required|exists:room_types,id'
            ]);

            // Nếu có lỗi validate, trả về lỗi
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            // Cập nhật thông tin phòng
            $room->update([
                'name' => $data['name'],
                'room_type_id' => $data['room_type_id']
            ]);

            // Tính capacity dựa trên số ghế liên kết với room_id
            $seatCount = Seat::where('room_id', $room->id)->count();
            $room->capacity = $seatCount;
            $room->save();

            // Trả về kết quả thành công
            return response()->json([
                'message' => 'Cập nhật phòng thành công',
                'room' => $room
            ], 200);
        } catch (\Exception $e) {
            // Nếu có lỗi, trả về thông tin lỗi (để debug)
            return response()->json([
                'error' => 'Đã xảy ra lỗi trong quá trình xử lý.',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {


        $ids = $request->input('ids');

        if (empty($ids)) {
            return response()->json(['message' => 'Không có phòng nào được chọn'], 400);
        }

        $deleted = Room::whereIn('id', $ids)->delete();

        if ($deleted) {
            return response()->json(['message' => 'Phòng đang bảo trì'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy phòng nào'], 404);
    }

    public function destroySingle(string $id)
    {
        // Tìm phòng theo ID
        $room = Room::find($id);

        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng'], 404);
        }

        // Xóa phòng
        $room->delete();

        return response()->json(['message' => 'Phòng đang bảo trì'], 200);
    }

    public function restore($id)
    {
        $room = Room::onlyTrashed()->find($id);

        if (!$room) {
            return response()->json(['message' => 'Không tìm thấy phòng đang bảo trì'], 404);
        }

        $room->restore(); // Khôi phục phòng

        return response()->json(['message' => 'Phòng đã bảo trì thành công'], 200);
    }
}
