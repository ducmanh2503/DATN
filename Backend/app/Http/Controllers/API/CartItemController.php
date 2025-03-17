<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\CartItem;
use App\Models\Combo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartItemController extends Controller
{
    // public function addComboToCart(Request $request)
    // {

    //     $request->validate([
    //         'cart_id' => 'required|exists:cart,id',
    //         'combo_id' => 'required|exists:combos,id',
    //         'seat_id' => 'required|exists:seats,id',
    //         'price_SATOBK' => 'required|numeric',
    //         'price_FATOBK' => 'required|numeric',
    //         'total_price' => 'required|numeric',
    //     ]);

    //     // Lấy combo từ cơ sở dữ liệu
    //     $combo = Combo::find($request->combo_id);

    //     // Kiểm tra combo có tồn tại không
    //     if (!$combo) {
    //         return response()->json(['message' => 'Combo không tồn tại'], 404);
    //     }

    //     // Thêm combo vào giỏ hàng
    //     $cartItem = CartItem::create([
    //         'cart_id' => $request->cart_id,
    //         'combo_id' => $request->combo_id,
    //         'seat_id' => $request->seat_id,
    //         'price_SATOBK' => $request->price_SATOBK,
    //         'price_FATOBK' => $request->price_FATOBK,
    //         'total_price' => $request->total_price,
    //     ]);

    //     return response()->json([
    //         'message' => 'Combo đã được thêm vào giỏ hàng thành công',
    //         'cart_item' => $cartItem,
    //     ], 201);
    // }

    // //add seat và showTime (code lỏ combo_id đang không được null khả năng phải sửa lại db)
    // public function addSeatToCart(Request $request)
    // {
    //     $request->validate([
    //         'cart_id' => 'required|exists:cart,id',
    //         'seat_id' => 'required|exists:seats,id',
    //         // 'show_times_id' => 'required|exists:show_times,id',
    //     ]);

    //     $cartItem = CartItem::where('cart_id', $request->cart_id)
    //         ->where('seat_id', $request->seat_id)
    //         // ->where('showtime_id', $request->showtime_id)
    //         ->first();


    //     if ($cartItem) {
    //         return response()->json(['message' => 'Ghế và suất chiếu đã có trong giỏ hàng'], 400);
    //     }
    //     $defaultComboId = null;

    //     $cartItem = CartItem::create([
    //         'cart_id' => $request->cart_id,
    //         'seat_id' => $request->seat_id,
    //         'combo_id' => $defaultComboId,
    //         // 'showtime_id' => $request->showtime_id,
    //         'total_price' => $this->calculateTotalPrice($request->cart_id), // Tính lại giá
    //     ]);

    //     return response()->json([
    //         'message' => 'Ghế và suất chiếu đã được thêm vào giỏ hàng',
    //         'cart_item' => $cartItem,
    //     ]);
    // }


    // //add showTime (trong bảng cart_item đang không có showTime mà showTime đang nằm ở booking)

    // public function addShowtimeToBooking(Request $request)
    // {
    //     $request->validate([
    //         'user_id' => 'required|exists:users,id',
    //         'showtime_id' => 'required|exists:show_times,id',
    //     ]);
    
    //     // Kiểm tra xem người dùng đã có booking chưa
    //     $booking = Booking::where('user_id', $request->user_id)
    //                       ->where('status', 'pending')
    //                       ->first();
    
    //     if ($booking) {
    //         // Nếu đã có booking, cập nhật showtime_id
    //         $booking->update(['showtime_id' => $request->showtime_id]);
    //     } else {
    //         // Nếu chưa có booking, tạo mới
    //         $booking = Booking::create([
    //             'user_id' => $request->user_id,
    //             'showtime_id' => $request->showtime_id,
    //             'total_ticket_price' => 0, // Chưa chọn ghế
    //             'total_combo_price' => 0, // Chưa chọn combo
    //             'status' => 'pending',
    //         ]);
    //     }
    
    //     return response()->json([
    //         'message' => 'Suất chiếu đã được lưu vào booking',
    //         'booking' => $booking
    //     ], 201);
    // }
    



    // //tính toán (code lỏ)
    // private function calculateTotalPrice($cart_id)
    // {
    //     // Tính tổng giá giỏ hàng (combo + ghế + suất chiếu)
    //     $cartItems = CartItem::where('cart_id', $cart_id)->get();
    //     $total = 0;

    //     foreach ($cartItems as $item) {
    //         $total += $item->total_price;
    //     }

    //     return $total;
    // }


    // //thanh toán (code lỏ chưa hoàn thiện)

    // public function checkout(Request $request)
    // {

    //     $request->validate([
    //         'cart_id' => 'required|exists:cart,id',
    //         'user_id' => 'required|exists:users,id',
    //         // 'payment_method' => 'required|string', // Ví dụ: 'credit_card', 'paypal', v.v.
    //     ]);

    //     $cartItems = CartItem::where('cart_id', $request->cart_id)->get();


    //     if ($cartItems->isEmpty()) {
    //         return response()->json(['message' => 'Giỏ hàng trống, không thể thanh toán'], 400);
    //     }

    //     // Tiến hành thanh toán (có thể tích hợp API thanh toán ở đây)
    //     $totalAmount = $this->calculateTotalPrice($request->cart_id);

    //     // Tạo đơn đặt hàng (booking)
    //     $booking = Booking::create([
    //         'user_id' => $request->user_id,
    //         'showtime_id' => $request->showtime_id, // Thêm dòng này
    //         'total_ticket_price' => $totalAmount,
    //         'total_combo_price' => 0, // Tổng tiền combo (nếu cần)
    //         'status' => 'pending',
    //     ]);

    //     return response()->json([
    //         'message' => 'Thanh toán thành công',
    //         'booking' => $booking,
    //     ]);
    // }


}
