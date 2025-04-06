<?php
return [
    'vnp_TmnCode' => env('VNP_TMN_CODE', 'GXTS9J8E'),
    'vnp_HashSecret' => env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E'),
    'vnp_Url' => env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'vnp_ReturnUrl' => env('VNP_RETURN_URL', 'https://localhost:8000/api/VNPay/return'),

    'app_id' => env('ZALOPAY_APP_ID', '2554'),
    'key1' => env('ZALOPAY_KEY1', 'sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn'),
    'key2' => env('ZALOPAY_KEY2', 'trMrHtvjo6myautxDUiAcYsVtaeQ8nhf'),
    'endpoint' => env('ZALOPAY_ENDPOINT', 'https://sb-openapi.zalopay.vn/v2'),
    'return_url' => env('ZALOPAY_RETURN_URL', 'http://localhost:8000/api/zalopay/return'),
];
