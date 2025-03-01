<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, $role)
    {
        // Lấy user hiện tại
        $user = Auth::guard('sanctum')->user();

        // Kiểm tra quyền
        if ($user->role !== $role) {
            return response()->json(['error' => 'Không có quyền truy cập'], 403);
        }

        return $next($request);
    }
}
