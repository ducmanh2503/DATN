<?php
return [
    'vnp_TmnCode' => env('VNP_TMN_CODE', 'GXTS9J8E'),
    'vnp_HashSecret' => env('VNP_HASH_SECRET', 'Y7EVYR6BH7GXOWUSYIFLWW9JHZV5DK7E'),
    'vnp_Url' => env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'vnp_ReturnUrl' => env('VNP_RETURN_URL', 'https://localhost:8000/api/VNPay/return'),
];
