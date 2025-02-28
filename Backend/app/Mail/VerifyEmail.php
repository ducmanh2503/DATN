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
            ? "<p>Bạn đã yêu cầu đặt lại mật khẩu.</p><p>Dưới đây là mã OTP đặt lại mật khẩu của bạn. Vui lòng không chia sẻ cho bất kỳ ai vì tính bảo mật của tài khoản</p><p>Mã OTP của bạn là: <strong>{$this->code}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>Trân trọng!"
            : "<p>Chào bạn!</p><p>Dưới đây là mã xác thực tài khoản của bạn. Vui lòng không chia sẻ cho bất kỳ ai vì tính bảo mật của tài khoản</p><p>Mã xác thực tài khoản của bạn là: <strong>{$this->code}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p><p>Trân trọng!</p>";

        return $this->subject($subject)->html($message);
    }
}
