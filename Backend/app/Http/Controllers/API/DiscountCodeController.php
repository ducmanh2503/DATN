<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use App\Models\Seat;
use App\Models\ShowTime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class DiscountCodeController extends Controller
{
    /**
     * Kiểm tra xem có ghế nào đang được giữ trong cache hay không
     */
    private function hasSeatsInCache()
    {
        // Lấy tất cả showTimeIds
        $showTimeIds = ShowTime::pluck('id');

        // Lấy tất cả seatIds
        $seatIds = Seat::pluck('id');

        // Kiểm tra từng showTimeId và seatId trong cache
        foreach ($showTimeIds as $showTimeId) {
            foreach ($seatIds as $seatId) {
                $cacheKey = "seat_{$showTimeId}_{$seatId}";
                if (Cache::has($cacheKey)) {
                    return true; // Có ít nhất một ghế đang được giữ trong cache
                }
            }
        }

        return false; // Không có ghế nào đang được giữ trong cache
    }

    public function applyDiscountCode(Request $request)
    {
        $request->validate([
            'name_code' => 'required|string',
        ]);

        $DiscountCode = DiscountCode::where('name_code', trim($request->name_code))
            ->where('status', 'active')
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now())
            ->first();

        if (!$DiscountCode) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.',
            ], 404);
        }

        // Kiểm tra quantity riêng
        if ($DiscountCode->quantity <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Rất tiếc, mã khuyến mãi này đã hết.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'discount_percent' => (int) $DiscountCode->percent,
            'maxPrice' => (int) $DiscountCode->maxPrice,
            'message' => 'Áp dụng mã khuyến mãi thành công!',
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $DiscountCodes = DiscountCode::query()->latest('id')->get();

        return response()->json($DiscountCodes, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_code' => 'required|string|max:255|unique:discount_code,name_code',
            'percent' => 'required|integer|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'maxPrice' => 'required|numeric|min:0',
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //lấy dữ liệu mã khuyến mãi
        $data = $request->all();

        //Thêm mã khuyến mãi mới
        $DiscountCode = DiscountCode::query()->create($data);

        return response()->json([
            'message' => 'Thêm mã khuyến mãi thành công',
            'data' => $DiscountCode
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //Tìm mã khuyến mãi theo id
        $DiscountCode = DiscountCode::find($id);

        if (!$DiscountCode) {
            return response()->json(['message' => 'không tìm thấy mã khuyến mãi'], 404);
        }

        return response()->json($DiscountCode, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //Tìm mã khuyến mãi theo id
        $DiscountCode = DiscountCode::find($id);

        if (!$DiscountCode) {
            return response()->json(['message' => 'không tìm thấy mã khuyến mãi'], 404);
        }

        // Kiểm tra xem có ghế nào đang được giữ trong cache không
        if ($this->hasSeatsInCache()) {
            return response()->json([
                'message' => 'Có người đang dùng mã khuyến mãi này, không thể cập nhật!'
            ], 409);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_code' => 'required|string|max:255|unique:discount_code,name_code,' . $id,
            'percent' => 'required|integer|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'maxPrice' => 'required|numeric|min:0',
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        //lấy dữ liệu mã khuyến mãi
        $data = $request->all();

        //Cập nhật mã khuyến mãi mới
        $DiscountCode->update($data);

        return response()->json([
            'message' => 'Cập nhật mã khuyến mãi thành công',
            'data' => $DiscountCode
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //Tìm mã khuyến mãi theo id
        $DiscountCode = DiscountCode::find($id);

        if (!$DiscountCode) {
            return response()->json(['message' => 'không tìm thấy mã khuyến mãi'], 404);
        }

        // Kiểm tra xem có ghế nào đang được giữ trong cache không
        if ($this->hasSeatsInCache()) {
            return response()->json([
                'message' => 'Có người đang dùng mã khuyến mãi này, không thể xóa!'
            ], 409);
        }

        //Xóa mã khuyến mãi
        $DiscountCode->delete();

        return response()->json(['message' => 'Xóa mã khuyến mãi thành công'], 200);
    }
}
