<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Kiểm tra nếu người dùng đã xác thực và có quyền admin
        if (!$request->user() || $request->user()->is_admin !== 1) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        return $next($request);
    }
}
