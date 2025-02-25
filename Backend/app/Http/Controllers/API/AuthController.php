<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Đăng ký tài khoản (Không gửi email ngay)
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
        if ($request->has('role') && $request->role === 'admin') {
            $existingAdmin = User::where('role', 'admin')->first();
            if ($existingAdmin) {
                return response()->json(['message' => 'Chỉ 1 tài khoản quản trị'], 403);
            }
        }

        // Mặc định user là customer
        $role = $request->has('role') && $request->role == 'admin' ? 'admin' : 'customer';

        // Tạo user nhưng chưa kích hoạt
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'role' => $role,
            'verification_code' => null, // Chưa tạo mã xác thực
            'is_verified' => false,
        ]);

        return response()->json(['message' => 'Đăng ký thành công. Vui lòng yêu cầu gửi mã xác thực.', 'user' => $user]);
    }

    // API gửi email xác thực (Tách riêng)
    public function resendVerificationEmail(Request $request)
    {
        // Validate email
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        // Tìm user
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Không tìm thấy tài khoản'], 404);
        }

        if ($user->is_verified) {
            return response()->json(['message' => 'Tài khoản đã được xác thực'], 400);
        }

        // Tạo mã xác thực mới
        $verificationCode = Str::random(6);
        $user->update(['verification_code' => $verificationCode]);

        // Gửi email
        Mail::to($user->email)->send(new VerifyEmail($verificationCode));

        return response()->json(['message' => 'Mã xác thực đã được gửi lại']);
    }

    // API đăng nhập
    public function login(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:6|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra thông tin đăng nhập
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Đăng nhập không thành công'], 401);
        }

        if (!$user->is_verified) {
            return response()->json(['message' => 'Tài khoản chưa xác thực. Vui lòng kiểm tra email.'], 403);
        }

        // Đăng nhập thành công, tạo API token
        $token = $user->createToken('auth_token')->plainTextToken;

        $redirectUrl = $user->role === 'admin' ? '/admin' : '/home';

        return response()->json(['message' => 'Đăng nhập thành công', 'token' => $token, 'redirect_url' => $redirectUrl]);
    }
}
