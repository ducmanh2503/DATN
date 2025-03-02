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
use App\Http\Controllers\API\SeatTypeController;
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

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']); // API lấy thông tin người dùng đã xác thực
//admin
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);


//Movie
Route::apiResource('movies', MoviesController::class);
Route::delete('/movies/force-delete/{movie}', [MoviesController::class, 'forceDeleteSingle']); // API xóa vĩnh viễn 1 phim
Route::delete('/movies', [MoviesController::class, 'destroyMultiple']); // API xóa mềm nhiều phim
Route::delete('/movies/force-delete-multiple', [MoviesController::class, 'forceDeleteMultiple']); // API xóa vĩnh viễn nhiều phim
Route::put('/movies/restore/{movie}', [MoviesController::class, 'restore']); // API khôi phục phim đã bị xóa mềm

Route::get('/movies/show-movie-destroy/{movie}', [MoviesController::class, 'showMovieDestroy']); // API hiển thị thông tin phim đã bị xóa mềm

//Room
Route::apiResource('room', RoomController::class);
Route::apiResource('room', RoomController::class);
Route::delete('/room', [RoomController::class, 'destroy']);
//Seats
Route::post('/seats', [SeatController::class, 'store']);
Route::get('/seats/room/{room_id}', [SeatController::class, 'getSeats']);
Route::post('/seats/update-status', [SeatController::class, 'updateSeatStatus']);
Route::get('/seat-types', [SeatTypeController::class, 'index']);
Route::delete('/seats/{seat}', [SeatController::class, 'destroy']);
Route::delete('/seats/room/{room_id}/delete-all', [SeatController::class, 'deleteAll']);
Route::put('/seats/{seat}', [SeatController::class, 'update']);
//showtimes
Route::apiResource('showTime', ShowTimeController::class);
Route::post('show-times/filter-by-date', [ShowTimeController::class, 'filterByDate']);


// CalendarShow
Route::apiResource('calendarShow', CalendarShowController::class);

//Combo
Route::apiResource('combo', ComboController::class);

// Xóa mềm nhiều combo
Route::delete('/combo', [ComboController::class, 'destroyMultiple']);

// Xóa vĩnh viễn nhiều combo
Route::delete('/combos/force-delete-multiple', [ComboController::class, 'forceDeleteMultiple']);

// Xóa vĩnh viễn 1 combo
Route::delete('/combo/force/{combo}', [ComboController::class, 'forceDeleteSingle']);

// Khôi phục 1 combo
Route::post('/combo/restore/{combo}', [ComboController::class, 'restore']);

// Khôi phục nhiều combo
Route::post('/combo/multiple/restore', [ComboController::class, 'restoreMultiple']);

// Thể loại phim
Route::apiResource('genres', GenreController::class);

//Diễn viên
Route::apiResource('actors', ActorController::class);

//Đạo diễn
Route::apiResource('directors', DirectorController::class);

