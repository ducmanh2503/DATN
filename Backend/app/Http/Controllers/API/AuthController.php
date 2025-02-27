<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate dữ liệu nhập vào
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed',
            'phone' => 'required|string|max:13|unique:users',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra nếu đăng ký tài khoản admin mà hệ thống đã có admin rồi
        if ($request->has('role') && $request->role === 'admin') {
            $existingAdmin = User::where('role', 'admin')->first();
            if ($existingAdmin) {
                return response()->json(['message' => 'Chỉ 1 tài khoản quản trị'], 403);
            }
        }

        // Mặc định user là customer
        $role = $request->role === 'admin' ? 'admin' : 'customer';

        // Tạo mã OTP (6 số)
        $verificationCode = Str::random(6);

        // Lưu OTP vào cache (TTL: 10 phút)
        Cache::put('verify_code:' . $request->email, [
            'code' => $verificationCode,
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'phone' => $request->phone,
            'role' => $role,
        ], now()->addMinutes(10));

        // Gửi email chứa mã OTP
        Mail::to($request->email)->send(new VerifyEmail($verificationCode));

        return response()->json(['message' => 'Mã xác thực đã gửi. Vui lòng kiểm tra email và nhập mã để hoàn tất.']);
    }

    public function verifyCode(Request $request)
    {
        // Validate mã xác thực
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Lấy dữ liệu từ cache
        $cachedData = Cache::get('verify_code:' . $request->email);

        if (!$cachedData) {
            return response()->json(['message' => 'Mã xác thực hết hạn hoặc không tồn tại.'], 400);
        }

        if ($request->code !== $cachedData['code']) {
            return response()->json(['message' => 'Mã xác thực không chính xác.'], 401);
        }

        // Xóa OTP sau khi xác thực thành công
        Cache::forget('verify_code:' . $request->email);

        // Lưu user vào database
        $user = User::create([
            'name' => $cachedData['name'],
            'email' => $cachedData['email'],
            'password' => $cachedData['password'],
            'phone' => $cachedData['phone'],
            'role' => $cachedData['role'],
            'is_verified' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Tài khoản đã được xác thực và đăng ký thành công.', 'token' => $token]);
    }

    public function resendVerificationEmail(Request $request)
    {
        // Validate email
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Kiểm tra email trong cache
        $cachedData = Cache::get('verify_code:' . $request->email);

        if (!$cachedData) {
            return response()->json(['message' => 'Mã xác thực đã hết hạn. Vui lòng đăng ký lại.'], 400);
        }

        // Tạo mã xác thực mới
        $verificationCode = Str::random(6);
        $cachedData['code'] = $verificationCode;

        // Lưu lại cache với TTL mới
        Cache::put('verify_code:' . $request->email, $cachedData, now()->addMinutes(10));

        // Gửi email mới
        Mail::to($request->email)->send(new VerifyEmail($verificationCode));

        return response()->json(['message' => 'Mã xác thực đã được gửi lại.']);
    }

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

        // Kiểm tra user
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Tài khoản hoặc mật khẩu không chính xác'], 401);
        }

        if (!$user->is_verified) {
            return response()->json(['message' => 'Tài khoản chưa xác thực. Vui lòng kiểm tra email.'], 403);
        }

        // Đăng nhập thành công, tạo API token
        $token = $user->createToken('auth_token')->plainTextToken;
        $redirectUrl = $user->role === 'admin' ? '/admin' : '/';

        return response()->json(['message' => 'Đăng nhập thành công', 'token' => $token, 'redirect_url' => $redirectUrl]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Xóa tất cả token của user
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Đăng xuất thành công'], 200);
    }
}
