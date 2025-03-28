<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Combo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ComboController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        // Lấy danh sách combo
        $combo = Combo::query()->latest('id')->get();

        return response()->json([
            'message' => 'Danh sách Combo',
            'combo' => $combo,

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
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            // Xử lý upload ảnh giống MoviesController
            if (isset($validated['image']) && $validated['image'] instanceof \Illuminate\Http\UploadedFile) {
                $imagePath = $validated['image']->store('images', 'public');
                $validated['image'] = Storage::url($imagePath);
            } else {
                throw new \Exception('No valid image file received');
            }

            $combo = Combo::create($validated);

            return response()->json([
                'message' => 'Thêm Combo thành công',
                'combo' => $combo
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi thêm combo: ' . $e->getMessage()
            ], 500);
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
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            // Xử lý upload ảnh giống MoviesController
            if (isset($validated['image']) && $validated['image'] instanceof \Illuminate\Http\UploadedFile) {
                // Xóa ảnh cũ nếu tồn tại
                if ($combo->image && Storage::disk('public')->exists(str_replace('/storage/', '', $combo->image))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $combo->image));
                }
                $imagePath = $validated['image']->store('images', 'public');
                $validated['image'] = Storage::url($imagePath);
            }

            $combo->update($validated);

            return response()->json([
                'message' => 'Cập nhật Combo thành công',
                'combo' => $combo
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi cập nhật combo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */

    //Xóa mềm nhiều Combo
    public function destroyMultiple(Request $request)
    {

        $ids = $request->input('ids'); // Lấy danh sách id phim cần xóa

        // Nếu không có phim nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có Combo nào được chọn'], 400);
        }

        //Xóa mềm các phim được chọn
        $deleted = Combo::whereIn('id', $ids)->delete();

        //Kiểm tra xem có phim nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Xóa combo thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy combo nào'], 404);
    }



    //Xóa mềm 1 Combo
    public function destroy($id)
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
    // Xóa vĩnh viễn nhiều Combo
    public function forceDeleteMultiple(Request $request)
    {


        $ids = $request->input('ids'); // Lấy danh sách ID combo cần xóa vĩnh viễn

        // Nếu không có combo nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có combo nào được chọn để xóa vĩnh viễn'], 400);
        }

        // Kiểm tra nếu combo có tồn tại trong bảng bị xóa mềm
        $combos = Combo::onlyTrashed()->whereIn('id', $ids)->get();

        // Nếu không có combo nào bị xóa mềm
        if ($combos->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy combo nào đã bị xóa mềm'], 404);
        }

        // Xóa vĩnh viễn tất cả các combo đã bị xóa mềm
        $deletedCount = $combos->count();
        Combo::onlyTrashed()->whereIn('id', $ids)->forceDelete();

        // Trả về phản hồi thành công
        return response()->json(['message' => "Xóa vĩnh viễn $deletedCount combo thành công"], 200);
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

    //---------------------------------------------------client-----------------------------------------------------//

    public function showCombosForClient(Request $request)
    {
        $combos = Combo::query()
            ->select('id', 'name', 'description', 'quantity', 'price', 'image') //lựa chọn trường cần thiét
            ->latest('id')->get();
        return response()->json([
            'message' => 'Danh sách combo',
            'combos' => $combos,
        ], 200);
    }

    // //thêm chức năng tìm kiếm
    // public function showCombosForClient(Request $request)
    // {
    //     $searchTerm = $request->input('search', '');

    //     $combos = Combo::query()
    //         ->select('id', 'name', 'description', 'quantity', 'price', 'image')
    //         ->where('name', 'LIKE', "%$searchTerm%") // Tìm kiếm theo tên
    //         ->orWhere('description', 'LIKE', "%$searchTerm%") // Tìm kiếm theo mô tả
    //         ->latest('id')
    //         ->paginate(10)->get();

    //     return response()->json([
    //         'message' => 'Danh sách combo',
    //         'combos' => $combos,
    //     ], 200);
    // }

}
