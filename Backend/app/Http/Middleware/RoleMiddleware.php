<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        // Kiểm tra quyền
        if ($role === 'admin') {
            // Chỉ admin mới có quyền truy cập
            if ($user->role !== 'admin') {
                return response()->json(['error' => 'Không có quyền truy cập'], 403);
            }
        } elseif ($role === 'admin_staff') {
            // Admin và staff đều có quyền truy cập
            if ($user->role !== 'admin' && $user->role !== 'staff') {
                return response()->json(['error' => 'Không có quyền truy cập'], 403);
            }
        } elseif ($user->role !== $role) {
            // Các vai trò khác phải khớp chính xác
            return response()->json(['error' => 'Không có quyền truy cập'], 403);
        }

        return $next($request);
    }
}
