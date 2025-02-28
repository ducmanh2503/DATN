<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $type; // Xác định loại email: đăng ký hoặc đặt lại mật khẩu

    public function __construct($code, $type = 'verify')
    {
        $this->code = $code;
        $this->type = $type;
    }

    public function build()
    {
        $subject = $this->type === 'reset' ? 'Mã OTP đặt lại mật khẩu' : 'Mã xác thực tài khoản';
        $message = $this->type === 'reset'
            ? "<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p>Mã OTP của bạn là: <strong>{$this->code}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>"
            : "<p>Chào mừng bạn!</p><p>Mã xác thực tài khoản của bạn là: <strong>{$this->code}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>";

        return $this->subject($subject)->html($message);
    }
}
