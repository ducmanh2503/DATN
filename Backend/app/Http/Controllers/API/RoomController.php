<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
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
                'capacity' => 'required|integer|min:1',
                'room_type' => 'required|in:2D,3D,4D'
            ]);

            // Nếu có lỗi validate, trả về lỗi
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            // Tạo phòng mới trong database
            $room = Room::create($data);

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
                'capacity' => 'required|integer|min:1',
                'room_type' => 'required|in:2D,3D,4D'
            ]);

            // Nếu có lỗi validate, trả về lỗi
            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            // Cập nhật thông tin phòng
            $room->update($data);

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

        // Nếu không có phòng nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có phòng nào được chọn'], 400);
        }

        //Xóa mềm các phòng được chọn
        $deleted = Room::whereIn('id', $ids)->delete();

        //Kiểm tra xem có phòng nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Phòng đang bảo trì'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy phòng nào'], 404);
    }

    public function restore($id)
    {
        $movie = Room::onlyTrashed()->find($id);

        if (!$movie) {
            return response()->json(['message' => 'Không tìm thấy phòng đang bảo trì'], 404);
        }

        $movie->restore(); // Khôi phục phim

        return response()->json(['message' => 'Phòng đã bảo trì thành công'], 200);
    }
}
