<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CalendarShow;
use App\Models\Combo;
use App\Models\Seat;
use App\Models\SeatTypePrice;
use App\Models\ShowTime;
use App\Models\ShowTimeDate;
use App\Services\UserRankService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class PaymentController extends Controller
{

    private $userRankService;

    public function __construct(UserRankService $userRankService)
    {
        $this->userRankService = $userRankService;
    }

    public function createVNPay(Request $request)
    {
        // Đảm bảo người dùng đã đăng nhập
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'totalPrice' => 'required|numeric|min:0',
            'movie_id' => 'required|exists:movies,id',
            'showtime_id' => 'required|exists:show_times,id',
            'calendar_show_id' => 'required|exists:calendar_show,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
            'combo_ids' => 'nullable|array',
            'combo_ids.*' => 'exists:combos,id',
            'order_desc' => 'nullable|string',
            'order_type' => 'nullable|string',
            'used_points' => 'nullable|integer|min:0',
            'discount_code' => 'nullable|string', // Client gửi name_code, BE tìm id
        ]);

        $bookingData = $request->all();
        $bookingData['payment_method'] = 'VNpay';
        $bookingData['user_id'] = auth()->id(); // Lấy user_id từ auth

        // Lấy ngày chiếu từ ShowTimeDate
        $showDate = ShowTimeDate::where('show_time_id', $request->showtime_id)
            ->value('show_date');

        // Tính giá ghế từ DB
        $seats = Seat::whereIn('id', $request->seat_ids)
            ->with('seatType')
            ->get();
        $totalTicketPrice = $seats->sum(function ($seat) use ($showDate) {
            return SeatTypePrice::getPriceByDate($seat->seat_type_id, $showDate) ?? $seat->seatType->price ?? 0;
        });

        // Tính giá combo từ DB
        $totalComboPrice = 0;
        if (!empty($request->combo_id)) {
            $comboQuantities = collect($request->combo_id)->groupBy(fn($id) => $id);
            $combos = Combo::whereIn('id', $comboQuantities->keys())->get();
            $totalComboPrice = $combos->sum(function ($combo) use ($comboQuantities) {
                $quantity = $comboQuantities[$combo->id]->count();
                return $combo->price * $quantity;
            });
        }

        $usedPoints = $request->input('used_points', 0);
        $pointDiscount = $usedPoints * 1000;
        $userData = $this->userRankService->getRankAndPoints(auth()->id());
        if ($usedPoints > $userData['points']) {
            return response()->json(['message' => 'Số điểm sử dụng vượt quá điểm tích lũy'], 400);
        }
        $totalPriceBeforeDiscount = $totalTicketPrice + $totalComboPrice;

        //xử lý mã khuyến mại
        $discountCode = $request->input('discount_code');
        $discountAmount = 0;
        $discountCodeId = null;

        if ($discountCode) {
            $discount = \App\Models\DiscountCode::where('name_code', $discountCode)
                ->where('status', 'active')
                ->where('quantity', '>', 0)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();

            if (!$discount) {
                return response()->json(['message' => 'Mã khuyến mại không hợp lệ hoặc đã hết hạn'], 400);
            }

            $discountAmount = $totalPriceBeforeDiscount * ($discount->percent / 100);
            $discountCodeId = $discount->id; // Lưu ID thay vì name_code

            $discount->quantity -= 1;
            $discount->save();
        }

        // Tổng giá thực tế từ DB
        $totalPrice = max(0, $totalPriceBeforeDiscount - $pointDiscount - $discountAmount);

        // Ghi dữ liệu giá vào bookingData
        $bookingData['pricing'] = [
            'total_ticket_price' => $totalTicketPrice,
            'total_combo_price' => $totalComboPrice,
            'total_price_before_discount' => $totalPriceBeforeDiscount,
            'point_discount' => $pointDiscount,
            'discount_amount' => $discountAmount,
            'discount_code_id' => $discountCodeId, // Lưu discount_code_id
            'discount_code' => $discountCode, // Giữ name_code để hiển thị
            'total_price' => $totalPrice,
            'used_points' => $usedPoints,
        ];

        // So sánh với totalPrice từ request (nếu cần kiểm tra)
        if ($request->totalPrice != $totalPrice) {
            Log::warning('Total price mismatch: Request = ' . $request->totalPrice . ', Calculated = ' . $totalPrice);
            // Có thể trả về lỗi nếu cần:
            // return response()->json(['message' => 'Total price mismatch'], 400);
        }

        $vnp_TxnRef = time() . "";
        Redis::setex("booking:$vnp_TxnRef", 3600, json_encode($bookingData)); // Lưu trong Redis 1 giờ

        $vnp_Url = env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_Returnurl = env('VNP_RETURN_URL', 'http://localhost:8000/api/VNPay/return');
        $vnp_TmnCode = env('VNP_TMN_CODE', 'GXTS9J8E');
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E');

        $vnp_OrderInfo = $request->input('order_desc', 'Thanh toán vé xem phim');
        $vnp_OrderType = $request->input('order_type', '250000');
        $vnp_Amount = $request->input('totalPrice') * 100;
        $vnp_Locale = 'vn';
        $vnp_BankCode = 'NCB';
        $vnp_IpAddr = $request->ip();

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        ksort($inputData);
        $query = http_build_query($inputData);
        $hashdata = $query;
        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $vnp_Url .= "?" . $query . "&vnp_SecureHash=" . $vnp_SecureHash;

        Log::info('Input Data: ', $inputData);
        return response()->json(['code' => '00', 'message' => 'thanh toán thành công', 'data' => $vnp_Url]);
    }

    public function VNPayReturn(Request $request)
    {
        Log::info('VNPay Return Request: ' . json_encode($request->all()));
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E');
        $vnp_SecureHash = $request->vnp_SecureHash;
        $inputData = $request->except('vnp_SecureHash');

        ksort($inputData);
        $hashData = http_build_query($inputData);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash === $vnp_SecureHash && $request->vnp_ResponseCode == '00') {
            $bookingData = json_decode(Redis::get("booking:$request->vnp_TxnRef"), true);

            if (!$bookingData) {
                Log::error('Booking data not found for TxnRef: ' . $request->vnp_TxnRef);
                return redirect()->away('http://localhost:3000/payment-result?status=failure');
            }

            $bookingData['is_payment_completed'] = true;
            Log::info('Merged Booking Data: ' . json_encode($bookingData));

            $ticketController = new TicketController(app(UserRankService::class));
            $response = $ticketController->getTicketDetails(new Request($bookingData));

            //trừ điểm nếu sử dụng
            $usedPoints = $bookingData['pricing']['used_points'] ?? 0;
            if ($usedPoints > 0) {
                $success = $this->userRankService->deductPoints($bookingData['user_id'], $usedPoints);
                if (!$success) {
                    Log::warning("Không thể trừ $usedPoints điểm cho user_id = {$bookingData['user_id']}");
                }
            }

            Redis::del("booking:$request->vnp_TxnRef");

            return redirect()->away(
                'http://localhost:3000/payment-result?status=success&booking_id=' . $response->getData()->booking_id
            );
        } else {
            return redirect()->away('http://localhost:3000/payment-result?status=failure');
        }
    }

    public function holdSeats(Request $request)
    {
        $request->validate([
            'showtime_id' => 'required|exists:show_times,id',
            'seat_ids' => 'required|array',
            'seat_ids.*' => 'exists:seats,id',
        ]);

        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        foreach ($request->seat_ids as $seatId) {
            $cacheKey = "seat_{$request->showtime_id}_{$seatId}";
            Cache::put($cacheKey, ['user_id' => $userId, 'expires_at' => now()->addMinutes(15)], 15); // Giữ 15 phút
        }

        $roomId = ShowTime::find($request->showtime_id)->room_id;
        $seatingMatrix = app(TicketController::class)->getSeatingMatrix($roomId, $request->showtime_id);
        broadcast(new \App\Events\SeatUpdated($roomId, $request->showtime_id, $seatingMatrix))->toOthers();

        return response()->json(['success' => true]);
    }
}
