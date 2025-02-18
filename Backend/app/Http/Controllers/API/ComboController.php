<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ComboController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Số lượng phòng hiển thị trên mỗi trang (mặc định là 5, có thể thay đổi qua query param)
        $perPage = $request->query('per_page', 5);

        // Lấy danh sách phòng và phân trang
        $combo = Combo::query()->latest('id')->paginate($perPage);

        // Trả về phản hồi dạng JSON với cấu trúc dữ liệu phân trang đầy đủ
        return response()->json([
            'message' => 'Danh Combo',
            'data' => $combo->items(),
            'pagination' => [
                'current_page' => $combo->currentPage(),
                'total_pages' => $combo->lastPage(),
                'total_combo' => $combo->total(),
                'per_page' => $combo->perPage(),
                'next_page_url' => $combo->nextPageUrl(),
                'prev_page_url' => $combo->previousPageUrl()
            ]
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|unique:combos,name',
                'description' => 'required|string',
                'quantity' => 'required|integer|min:1',
                'price' => 'required|numeric|min:0',
                'image' => 'required|string',
            ]);

            $combo = Combo::create($validated);
            return response()->json([
                'message' => 'Thêm Combo thành công',
                'combo' => $combo
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $combo = Combo::findOrFail($id);
        return response()->json($combo);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $combo = Combo::findOrFail($id);

        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|unique:combos,name,' . $id,
                'description' => 'sometimes|string',
                'quantity' => 'sometimes|integer|min:1',
                'price' => 'sometimes|numeric|min:0',
                'image' => 'sometimes|string',
            ]);

            $combo->update($validated);
            return response()->json([
                'message' => 'Cập nhật Combo thành công',
                'combo' => $combo
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */

    //Xóa mềm nhiều Combo
    public function destroyMultiple(Request $request)
    {
        $ids = $request->input('ids'); // Lấy danh sách id combo cần xóa

        // Nếu không có combo nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có Combo nào được chọn'], 400);
        }

        //Xóa mềm các combo được chọn
        $deleted = Combo::whereIn('id', $ids)->delete();

        //Kiểm tra xem có combo nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Xóa combo thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy combo nào'], 404);
    }



    //Xóa mềm 1 Combo
    public function destroySingle($id)
    {
        try {
            // Tìm combo theo ID
            $combo = Combo::findOrFail($id);

            // Xóa combo
            $combo->delete();

            // Trả về phản hồi thành công
            return response()->json(['message' => 'Xóa combo thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi xóa combo: ' . $e->getMessage()], 500);
        }
    }

    //Xóa vĩnh viễn nhiều Combo
    public function forceDeleteMultiple(Request $request)
    {
        $ids = $request->input('ids'); // Lấy danh sách id combo cần xóa

        // Nếu không có combo nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có combo nào được chọn'], 400);
        }

        //Xóa mềm các combo được chọn
        $deleted = Combo::onlyTrashed()->whereIn('id', $ids)->forceDelete();

        //Kiểm tra xem có combo nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Xóa vĩnh viễn combo thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy combo nào'], 404);
    }

    // Xóa vĩnh viễn 1 Combo 
    public function forceDeleteSingle($id)
    {
        // Tìm combo đã xóa mềm theo ID
        $combo = Combo::onlyTrashed()->find($id);

        // Kiểm tra nếu không tìm thấy combo
        if (!$combo) {
            return response()->json(['message' => 'Combo không tồn tại hoặc đã bị xóa vĩnh viễn'], 404);
        }

        // Xóa vĩnh viễn combo
        $combo->forceDelete();

        // Trả về phản hồi thành công
        return response()->json(['message' => 'Xóa vĩnh viễn combo thành công'], 200);
    }


    // Khôi phục 1 Combo
    public function restore($id)
    {
        $combo = Combo::onlyTrashed()->find($id);

        if (!$combo) {
            return response()->json(['message' => 'Không tìm thấy combo đã bị xóa'], 404);
        }

        $combo->restore(); // Khôi phục combo

        return response()->json(['message' => 'Khôi phục combo thành công'], 200);
    }

    //Khôi phục nhiều Combo
    public function restoreMultiple(Request $request)
    {
        $ids = $request->input('ids'); // Lấy danh sách id combo cần khôi phục

        // Nếu không có combo nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có combo nào được chọn để khôi phục'], 400);
        }

        // Khôi phục các combo đã bị xóa mềm
        $restored = Combo::onlyTrashed()->whereIn('id', $ids)->restore();

        // Kiểm tra xem có combo nào được khôi phục không
        if ($restored) {
            return response()->json(['message' => 'Khôi phục combo thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy combo nào đã xóa mềm'], 404);
    }
}
