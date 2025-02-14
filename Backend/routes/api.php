<?php

use App\Http\Controllers\API\MoviesController;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\SeatController;
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
Route::delete('/movies/force-delete/{movie}', [MoviesController::class, 'forceDelete']); // API xóa vĩnh viễn phim đã bị xóa mềm
Route::put('/movies/restore/{movie}', [MoviesController::class, 'restore']); // API khôi phục phim đã bị xóa mềm
//Room
Route::apiResource('room', RoomController::class);

//Seats
Route::apiResource('seat', SeatController::class);
