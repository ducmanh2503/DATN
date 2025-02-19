<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ShowTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShowTimeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $showTime = ShowTime::with(['movie', 'room'])->get();

        return response()->json($showTime, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'movie_id' => 'required|exists:movies,id',
            'room_id' => 'required|exists:rooms,id',
            'show_date' => 'required|date',
            'show_time' => 'required|date_format:H:i:s',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Thêm lịch chiếu
        $showTime = ShowTime::create([
            'movie_id' => $request->movie_id,
            'room_id' => $request->room_id,
            'show_date' => $request->show_date,
            'show_time' => $request->show_time,
        ]);

        return response()->json(['message' => 'Lịch chiếu đã được thêm thành công', 'data' => $showTime], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $showTime = ShowTime::with(['movie', 'room'])->find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Lịch chiếu không tồn tại'], 404);
        }

        return response()->json($showTime);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'room_id' => 'required|exists:rooms,id',
            'show_date' => 'required|date',
            'show_time' => 'required|date_format:H:i',
        ]);

        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu'], 404);
        }

        $showTime->update($validated);

        return response()->json([
            'message' => 'Cập nhật lịch chiếu thành công',
            'data' => $showTime
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu'], 404);
        }

        $showTime->delete();

        return response()->json([
            'message' => 'Lịch chiếu đã được gỡ'
        ]);
    }
}
