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
        $showTime = ShowTime::query()->latest('id')->with(['calendar_show_id', 'room'])->get();

        return response()->json($showTime, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'required|in:referenced,now_showing,coming_soon',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Thêm lịch chiếu
        $showTime = ShowTime::create([
            'calendar_show_id' => $request->calendar_show_id,
            'room_id' => $request->room_id,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Xuất chiếu đã được thêm thành công', 'data' => $showTime], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $showTime = ShowTime::with(['calendar_show_id', 'room'])->find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Xuất chiếu không tồn tại'], 404);
        }

        return response()->json($showTime);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'room_id' => 'required|exists:rooms,id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s',
            'status' => 'required|in:referenced,now_showing,coming_soon',
        ]);

        $showTime = ShowTime::find($id);

        if (!$showTime) {
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $showTime->update($validated);

        return response()->json([
            'message' => 'Cập nhật xuất chiếu thành công',
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
            return response()->json(['message' => 'Không tìm thấy xuất chiếu'], 404);
        }

        $showTime->delete();

        return response()->json([
            'message' => 'Xuất chiếu đã được gỡ'
        ]);
    }
}
