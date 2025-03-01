<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        //Danh sách người dùng
        $users = User::query()->latest('id')->get();

        //Danh sách người dùng bị khóa
        $trashedUsers = User::onlyTrashed()->get();

        return response()->json([
            'users' => $users,
            'trashedUsers' => $trashedUsers,
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        // Tìm người dùng theo id
        $user = User::find($id);

        // Nếu không tìm thấy diễn viên
        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại'], 404);
        }

        return response()->json($user, 200);
    }

    public function showUserDestroy(string $id)
    {


        //Tìm người dùng theo id
        $user = User::onlyTrashed()->find($id);

        //nếu không tìm thấy trả về 404
        if (!$user) {
            return response()->json([
                'message' => 'Không tìm thấy người dùng này',
            ], 404);
        }

        //trả về chi tiết người dùng
        return response()->json([
            'message' => 'Thông tin chi tiết người dùng',
            'data' => $user
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        // Tìm người dùng theo id
        $user = User::find($id);

        // Nếu không tìm thấy người dùng
        if (!$user) {
            return response()->json(['message' => 'người dùng không tồn tại'], 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255',
            'phone' => 'required|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //Lấy dữ liệu người dùng
        $data = $request->all();

        // Cập nhật người dùng
        $user->update($data);

        return response()->json(['message' => 'Cập nhật người dùng thành công', 'data' => $user], 200);
    }

    /**
     * Xóa mềm người dùng (đổi qua trạng thái tài khoản bị khóa)
     */
    public function destroy($id)
    {


        try {
            // Tìm người dùng theo ID
            $user = User::findOrFail($id);

            // khóa người dùng
            $user->delete();

            // Trả về phản hồi thành công
            return response()->json(['message' => 'Khóa tài khoản người dùng thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi khóa người dùng: ' . $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {


        $user = User::onlyTrashed()->find($id);

        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy người dùng bị khóa'], 404);
        }

        $user->restore(); // Khôi phục người dùng

        return response()->json(['message' => 'Khôi phục lại người dùng thành công'], 200);
    }
}
