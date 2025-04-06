<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ZaloPayService
{
    protected $appId;
    protected $key1;
    protected $key2;
    protected $endpoint;
    protected $return_url;

    public function __construct()
    {
        $this->appId = config('payment.app_id');
        $this->key1 = config('payment.key1');
        $this->key2 = config('payment.key2');
        $this->endpoint = config('payment.endpoint');
        $this->return_url = config('payment.return_url');

        // Kiểm tra các giá trị cấu hình
        if (empty($this->appId) || empty($this->key1) || empty($this->key2) || empty($this->endpoint)) {
            Log::error('ZaloPayService Configuration Error: Missing required configuration values.', [
                'appId' => $this->appId,
                'key1' => $this->key1,
                'key2' => $this->key2,
                'endpoint' => $this->endpoint,
            ]);
            throw new \Exception('ZaloPay configuration is incomplete. Please check your payment configuration.');
        }

        Log::info('ZaloPayService Initialized:', [
            'appId' => $this->appId,
            'key1' => $this->key1, // Thêm log để kiểm tra
            'endpoint' => $this->endpoint,
            'return_url' => $this->return_url,
        ]);
    }

    public function createOrder($amount, $orderId, $description, $appUser = null)
    {
        $appTransId = date('ymd') . '_' . Str::random(10); // Tạo app_trans_id dạng YYMMDD_random
        $appTime = round(microtime(true) * 1000); // Thời gian giao dịch (milliseconds)
    
        $params = [
            'appid' => (int) $this->appId, // Ép kiểu thành số nguyên
            'apptransid' => $appTransId,
            'apptime' => (int) $appTime, // Ép kiểu thành số nguyên
            'amount' => (int) $amount, // Ép kiểu thành số nguyên
            'appuser' => $appUser ?? 'user_' . Str::random(5),
            'embeddata' => json_encode(['orderid' => $orderId]),
            'item' => json_encode([]),
            'description' => $description,
            'bankcode' => '',
            'callback_url' => $this->return_url,
        ];
    
        // Tạo mac (message authentication code) để xác thực
        $data = $params['appid'] . '|' . $params['apptransid'] . '|' . $params['appuser'] . '|' . $params['amount'] . '|' . $params['apptime'] . '|' . $params['embeddata'] . '|' . $params['item'];
        $params['mac'] = hash_hmac('sha256', $data, $this->key1);
    
        // Log chi tiết để debug
        Log::info('ZaloPay Create Order Data for MAC:', ['data' => $data]);
        Log::info('ZaloPay Create Order Params:', $params);
    
        // Gửi yêu cầu tới ZaloPay API
        try {
            $response = Http::post($this->endpoint . '/create', $params);
            $result = $response->json();
        } catch (\Exception $e) {
            Log::error('ZaloPay Create Order Request Failed:', ['error' => $e->getMessage()]);
            $result = null;
        }
    
        Log::info('ZaloPay Create Order Response:', $result ?? []);
    
        return [
            'app_trans_id' => $appTransId,
            'response' => $result,
        ];
    }

    public function verifyCallback($data)
    {
        $mac = hash_hmac('sha256', $data['data'], $this->key2);
        return $mac === $data['mac'];
    }
}