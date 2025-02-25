<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationCode;

    public function __construct($verificationCode)
    {
        $this->verificationCode = $verificationCode;
    }

    public function build()
    {
        // return $this->subject('Mã xác thực tài khoản')
        //     ->text('emails.plain_verify_email') // Gửi dạng plain text
        //     ->with(['verificationCode' => $this->verificationCode]);

        return $this->subject('Mã xác thực tài khoản')
            ->html("Mã xác thực của bạn là: <strong>{$this->verificationCode}</strong>");
    }
}
