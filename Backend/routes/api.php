<?php

use App\Http\Controllers\API\ComboController;
use App\Http\Controllers\API\MoviesController;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\SeatController;
use App\Http\Controllers\API\ShowTimeController;

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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//Movie
Route::apiResource('movies', MoviesController::class);
Route::delete('/movies/force-delete/{movie}', [MoviesController::class, 'forceDeleteSingle']); // API xóa vĩnh viễn 1 phim
Route::delete('/movies', [MoviesController::class, 'destroyMultiple']); // API xóa mềm nhiều phim
Route::delete('/movies/force-delete', [MoviesController::class, 'forceDeleteMultiple']); // API xóa vĩnh viễn nhiều phim
Route::put('/movies/restore/{movie}', [MoviesController::class, 'restore']); // API khôi phục phim đã bị xóa mềm
//Room
Route::apiResource('room', RoomController::class);

//Seats
Route::post('/seats', [SeatController::class, 'store']);
Route::get('/seats/room/{room_id}', [SeatController::class, 'getSeats']);
Route::post('/seats/update-status', [SeatController::class, 'updateSeatStatus']);

//showtimes
Route::apiResource('showTime', ShowTimeController::class);

//Combo
Route::apiResource('combo', ComboController::class);

// Xóa mềm nhiều combo
Route::delete('/combo', [ComboController::class, 'destroyMultiple']);

// Xóa mềm 1 combo
Route::delete('/combo/{combo}', [ComboController::class, 'destroySingle']);

// Xóa vĩnh viễn nhiều combo
Route::delete('/combos/force-delete-multiple', [ComboController::class, 'forceDeleteMultiple']);

// Xóa vĩnh viễn 1 combo
Route::delete('/combo/force/{combo}', [ComboController::class, 'forceDeleteSingle']);

// Khôi phục 1 combo 
Route::post('/combo/restore/{combo}', [ComboController::class, 'restore']);

// Khôi phục nhiều combo 
Route::post('/combo/multiple/restore', [ComboController::class, 'restoreMultiple']);
