<?php

use App\Http\Controllers\API\ActorController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CalendarShowController;
use App\Http\Controllers\API\ComboController;
use App\Http\Controllers\API\DirectorController;
use App\Http\Controllers\API\GenreController;
use App\Http\Controllers\API\MoviesController;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\SeatController;
use App\Http\Controllers\API\ShowTimeController;
use App\Http\Controllers\API\SocialAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    // Lấy thông tin user đã đăng nhập
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Movies
    Route::apiResource('movies', MoviesController::class);
    Route::delete('/movies/force-delete/{movie}', [MoviesController::class, 'forceDeleteSingle']);
    Route::delete('/movies', [MoviesController::class, 'destroyMultiple']);
    Route::delete('/movies/force-delete-multiple', [MoviesController::class, 'forceDeleteMultiple']);
    Route::put('/movies/restore/{movie}', [MoviesController::class, 'restore']);
    Route::get('/movies/show-movie-destroy/{movie}', [MoviesController::class, 'showMovieDestroy']);

    // Room
    Route::apiResource('room', RoomController::class);

    // Seats
    Route::post('/seats', [SeatController::class, 'store']);
    Route::get('/seats/room/{room_id}', [SeatController::class, 'getSeats']);
    Route::post('/seats/update-status', [SeatController::class, 'updateSeatStatus']);

    // Showtimes
    Route::apiResource('showTime', ShowTimeController::class);
    Route::post('show-times/filter-by-date', [ShowTimeController::class, 'filterByDate']);
    Route::post('show-times/filter-by-date-one', [ShowTimeController::class, 'filterByDateOne']);

    // CalendarShow
    Route::apiResource('calendarShow', CalendarShowController::class);

    // Combo
    Route::apiResource('combo', ComboController::class);
    Route::delete('/combo', [ComboController::class, 'destroyMultiple']);
    Route::delete('/combos/force-delete-multiple', [ComboController::class, 'forceDeleteMultiple']);
    Route::delete('/combo/force/{combo}', [ComboController::class, 'forceDeleteSingle']);
    Route::post('/combo/restore/{combo}', [ComboController::class, 'restore']);
    Route::post('/combo/multiple/restore', [ComboController::class, 'restoreMultiple']);

    // Thể loại phim, Diễn viên, Đạo diễn
    Route::apiResource('genres', GenreController::class);
    Route::apiResource('actors', ActorController::class);
    Route::apiResource('directors', DirectorController::class);


    // Đăng xuất
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/resend-verification-email', [AuthController::class, 'resendVerificationEmail']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/login', [AuthController::class, 'login']);

// Đăng nhập bằng Google & Facebook
Route::get('auth/google', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// Route::get('auth/facebook', [SocialAuthController::class, 'redirectToFacebook']);
// Route::get('auth/facebook/callback', [SocialAuthController::class, 'handleFacebookCallback']);
