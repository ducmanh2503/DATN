<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    // Chuyển hướng đến Google
    public function redirectToGoogle()
    {
        $redirectUrl = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        return response()->json(['url' => $redirectUrl]);
    }

    // Xử lý callback từ Google
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Cấu hình Guzzle cho Socialite
            $clientOptions = [
                'verify' => 'H:/laragon/etc/ssl/cacert.pem',
            ];

            // Áp dụng cấu hình và lấy user
            $googleUser = Socialite::driver('google')
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->user();

            // Kiểm tra xem user đã tồn tại chưa
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Nếu chưa có tài khoản thì tạo mới
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'phone' => null,
                    'is_verified' => true,
                    'password' => bcrypt(Str::random(16)), // Mật khẩu ngẫu nhiên
                    'google_id' => $googleUser->getId()
                ]);
            } else {
                // Nếu user đã tồn tại, cập nhật is_verified thành true (nếu chưa phải là true)
                if ($user->is_verified != true) {
                    $user->update(['is_verified' => true,]);
                }
            }


            // Tạo token để ReactJS dùng
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Đăng nhập thành công',
                'user' => $user,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Đăng nhập thất bại', 'error' => $e->getMessage()], 500);
        }
    }

    // Redirect to Facebook
    // public function redirectToFacebook()
    // {
    //     return Socialite::driver('facebook')->redirect();
    // }

    // // Handle Facebook callback
    // public function handleFacebookCallback()
    // {
    //     $facebookUser = Socialite::driver('facebook')->user();

    //     $user = User::updateOrCreate([
    //         'email' => $facebookUser->getEmail(),
    //     ], [
    //         'name' => $facebookUser->getName(),
    //         'facebook_id' => $facebookUser->getId(),
    //         'password' => bcrypt(uniqid()),
    //     ]);

    //     $token = $user->createToken('auth_token')->plainTextToken;

    //     return response()->json([
    //         'access_token' => $token,
    //         'user' => $user
    //     ]);
    // }
}
