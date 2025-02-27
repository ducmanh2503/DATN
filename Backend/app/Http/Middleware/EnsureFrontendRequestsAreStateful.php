<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\Sanctum;

class EnsureFrontendRequestsAreStateful
{
    public function handle(Request $request, Closure $next)
    {
        if (Sanctum::currentApplicationUrlWithPort() === $request->headers->get('origin')) {
            config(['sanctum.stateful' => true]);
        }

        return $next($request);
    }
}
