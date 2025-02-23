<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;

use App\Models\Movies;
use App\Policies\MoviesPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Đăng ký policy cho Movies model
        Movies::class => MoviesPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
