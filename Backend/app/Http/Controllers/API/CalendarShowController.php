<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CalendarShow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class CalendarShowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $calendarShows = CalendarShow::query()->latest('id')->with(['movie'])->get();

        return response()->json($calendarShows, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'movie_id' => 'required|exists:movies,id',
            'show_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Thêm lịch chiếu
        $calendarShows = CalendarShow::create([
            'movie_id' => $request->movie_id,
            'show_date' => $request->show_date,
            'end_date' => $request->end_date,
        ]);

        return response()->json(['message' => 'Lịch chiếu đã được thêm thành công', 'data' => $calendarShows], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $movie_id)
    {
        $calendarShows = CalendarShow::with(['movie'])->where('movie_id', $movie_id)->get();

        if ($calendarShows->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu cho phim này'], 404);
        }

        return response()->json($calendarShows);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {

        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'show_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $calendarShows = CalendarShow::find($id);

        if (!$calendarShows) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu'], 404);
        }

        $calendarShows->update($validated);

        return response()->json([
            'message' => 'Cập nhật lịch chiếu thành công',
            'data' => $calendarShows
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {

        $calendarShows = CalendarShow::find($id);

        if (!$calendarShows) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu'], 404);
        }

        $calendarShows->delete();

        return response()->json([
            'message' => 'Lịch chiếu đã được gỡ'
        ]);
    }
}
