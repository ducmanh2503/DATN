<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{

    public function createVNPay(Request $request)
    {
        $vnp_Url = env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_Returnurl = env('VNP_RETURN_URL', 'http://localhost:8000/api/VNPay/return');
        $vnp_TmnCode = env('VNP_TMN_CODE', 'GXTS9J8E'); //Mã website tại VNPAY 
        $vnp_HashSecret = env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E'); //Chuỗi bí mật

        $vnp_TxnRef = time() . ""; //Mã đơn hàng. Trong thực tế Merchant cần insert đơn hàng vào DB và gửi mã này 
        $vnp_OrderInfo = $request->input('order_desc', 'order_desc');
        $vnp_OrderType = $request->input('order_type', 'order_type');
        $vnp_Amount = ($request->input('totalPrice', 10000)) * 100;
        $vnp_Locale = 'vn';
        $vnp_BankCode = 'NCB';
        $vnp_IpAddr = $request->ip();
        //Add Params of 2.0.1 Version

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

        //var_dump($inputData);
        ksort($inputData);
        $query = http_build_query($inputData);
        $hashdata = $query;
        $vnp_SecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $vnp_Url .= "?" . $query . "&vnp_SecureHash=" . $vnp_SecureHash;
        Log::info('Input Data: ', $inputData);
        Log::info('Hash Data: ' . $hashdata);
        Log::info('Secret: ' . $vnp_HashSecret);
        Log::info('Secure Hash: ' . $vnp_SecureHash);
        return response()->json(['code' => '00', 'message' => 'thanh toán thành công', 'data' => $vnp_Url]);
    }

    // public function VNPayReturn(Request $request)
    // {
    //     Log::info('VNPay Return Request: ' . json_encode($request->all()));
    //     $vnp_HashSecret = env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E');
    //     $vnp_SecureHash = $request->vnp_SecureHash;
    //     $inputData = $request->except('vnp_SecureHash');

    //     ksort($inputData);
    //     $hashData = http_build_query($inputData);
    //     $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

    //     if ($secureHash === $vnp_SecureHash) {
    //         if ($request->vnp_ResponseCode == '00') {
    //             return response()->json([
    //                 'message' => 'Thanh toán thành công',
    //                 'data' => $request->all()
    //             ]);
    //         } else {
    //             return response()->json(['message' => 'Thanh toán thất bại'], 400);
    //         }
    //     } else {
    //         return response()->json(['message' => 'Dữ liệu không hợp lệ'], 400);
    //     }
    // }




    //---------------------------test----------------------------//

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
            $bookingData = session('booking_data');
            $bookingData['is_payment_completed'] = true;

            $ticketController = new TicketController();

            $response = $ticketController->getTicketDetails(new Request($bookingData));

            session()->forget('booking_data');
            
            return redirect()->away(
                'http://localhost:8000/payment-result?status=success&booking_id=' . $response->getData()->booking_id
            );
        } else {
            return redirect()->away('http://localhost:3000/payment-result?status=failure');
        }
    }
    //---------------------------end-test----------------------------//
}
