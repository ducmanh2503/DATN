<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed',
            'phone' => 'required|string|max:13|unique:users',
            'is_admin' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra nếu đang cố gắng tạo admin và đã có admin trong hệ thống
        if (
            $request->has('is_admin') && $request->is_admin == true
        ) {
            // Kiểm tra nếu đã có admin
            $existingAdmin = User::where('is_admin', true)->first();
            if ($existingAdmin) {
                return response()->json(['message' => 'Chỉ 1 tài khoản quản trị'], 403);
            }
        }

        // Nếu không phải admin, hoặc không gán is_admin trong request, thì mặc định là false
        $isAdmin = $request->has('is_admin') && $request->is_admin == true ? true : false;

        // Đăng ký người dùng
        $user = User::query()->create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'is_admin' => $isAdmin,
        ]);

        return response()->json(['message' => 'Đăng ký thành công', 'user' => $user]);
    }

    //Đăng nhập và lấy API token
    public function login(Request $request)
    {
        // Validate request
        // $validator = Validator::make($request->all(), [
        //     'email' => 'required|string|email|max:255',
        //     'password' => 'required|string|min:6|max:100',
        // ]);

        // if ($validator->fails()) {
        //     return response()->json(['error' => $validator->errors()], 422);
        // }

        // Kiểm tra thông tin đăng nhập
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Đăng nhập không thành công'], 401);
        }

        // Đăng nhập thành công, tạo API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Đăng nhập thành công', 'token' => $token]);
    }
}
