<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DiscountCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DiscountCodeController extends Controller
{
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

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name_code' => 'required|string|max:255|unique:discount_code,name_code',
            'percent' => 'required|integer|max:100',
            'quantity' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
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

        //Xóa mã khuyến mãi
        $DiscountCode->delete();

        return response()->json(['message' => 'Xóa mã khuyến mãi thành công'], 200);
    }
}
