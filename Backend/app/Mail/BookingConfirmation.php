<?php

namespace App\Mail;

// use BaconQrCode\Encoder\QrCode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BookingConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $ticketDetails;

    /**
     * Create a new message instance.
     */
    public function __construct($booking, $ticketDetails)
    {
        $this->booking = $booking;
        $this->ticketDetails = $ticketDetails;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Đặt vé thành công',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildEmailContent(),
        );
    }

    protected function buildEmailContent(): string
{
    $seats = implode(', ', array_map(function ($seat) {
        return "{$seat['row']}{$seat['column']} ({$seat['seat_type']})";
    }, $this->ticketDetails['seats']->toArray()));

    $combos = '';
    if (!empty($this->ticketDetails['combos'])) {
        $combos = implode(', ', array_map(function ($combo) {
            return "{$combo['display']} - " . number_format($combo['price'], 0, ',', '.') . " VNĐ";
        }, $this->ticketDetails['combos']->toArray()));
    }
    $comboDisplay = $combos ? $combos : 'Không có';

    $qrData = "Mã đặt vé: {$this->booking->id}\n" .
        "Phim: {$this->ticketDetails['movie']['title']}\n" .
        "Ngày chiếu: {$this->ticketDetails['show_date']}\n" .
        "Giờ chiếu: {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}\n" .
        "Phòng: {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})\n" .
        "Ghế: {$seats}";

    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
    $qrCode = base64_encode(file_get_contents($qrUrl));
    Log::info('QR Code Base64 (Mail): ' . $qrCode);

    return <<<HTML
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đặt vé</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: #ff4d4d;
                color: #fff;
                padding: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
            }
            .content h2 {
                color: #ff4d4d;
                font-size: 20px;
                margin-top: 20px;
            }
            .content p {
                margin: 10px 0;
                line-height: 1.6;
            }
            .ticket-info {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .ticket-info p {
                margin: 5px 0;
            }
            .qr-section {
                text-align: center;
            }
            .qr-section img {
                margin: 10px 0;
                border: 2px solid #ff4d4d;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                padding: 15px;
                background: #f4f4f4;
                font-size: 12px;
                color: #666;
            }
            .highlight {
                font-weight: bold;
                color: #ff4d4d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Xác nhận đặt vé thành công</h1>
            </div>
            <div class="content">
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đặt vé tại hệ thống của chúng tôi! Dưới đây là thông tin chi tiết về vé của bạn:</p>

                <div class="ticket-info">
                    <h2>Thông tin vé</h2>
                    <p><span class="highlight">Phim:</span> {$this->ticketDetails['movie']['title']}</p>
                    <p><span class="highlight">Ngày chiếu:</span> {$this->ticketDetails['show_date']}</p>
                    <p><span class="highlight">Giờ chiếu:</span> {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}</p>
                    <p><span class="highlight">Phòng:</span> {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})</p>
                    <p><span class="highlight">Ghế:</span> {$seats}</p>
                    <p><span class="highlight">Combo:</span> {$comboDisplay}</p>
                    <p><span class="highlight">Tổng giá vé:</span> {$this->ticketDetails['pricing']['total_ticket_price']} VNĐ</p>
                    <p><span class="highlight">Tổng giá combo:</span> {$this->ticketDetails['pricing']['total_combo_price']} VNĐ</p>
                    <p><span class="highlight">Ưu đãi từ voucher:</span> - {$this->ticketDetails['pricing']['total_price_voucher']} VNĐ</p>
                    <p><span class="highlight">Ưu đãi từ đổi stars:</span> - {$this->ticketDetails['pricing']['total_price_point']} VNĐ</p>
                    <p><span class="highlight">Tổng cộng:</span> {$this->ticketDetails['pricing']['total_price']} VNĐ</p>
                    <p><span class="highlight">Phương thức thanh toán:</span> {$this->ticketDetails['payment_method']}</p>
                    <p><span class="highlight">Mã đặt vé:</span> {$this->booking->id}</p>
                </div>

                <div class="qr-section">
                    <h2>QR Code vé của bạn</h2>
                    <img src="data:image/png;base64,{$qrCode}" alt="QR Code" width="200" height="200">
                    <p>File QR code cũng được đính kèm dưới dạng PNG để bạn tải về nếu cần.</p>
                </div>

                <p>Vui lòng giữ mã đặt vé hoặc QR code để kiểm tra tại rạp. Chúc bạn có một buổi xem phim vui vẻ!</p>
            </div>
            <div class="footer">
                <p>© 2025 Hệ thống đặt vé xem phim. Mọi quyền được bảo lưu.</p>
            </div>
        </div>
    </body>
    </html>
    HTML;
}

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $qrData = "Mã đặt vé: {$this->booking->id}\n" .
            "Phim: {$this->ticketDetails['movie']['title']}\n" .
            "Ngày chiếu: {$this->ticketDetails['calendar_show']['show_date']}\n" .
            "Giờ chiếu: {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}\n" .
            "Phòng: {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})\n" .
            "Ghế: " . implode(', ', array_map(function ($seat) {
                return "{$seat['row']}{$seat['column']} ({$seat['seat_type']})";
            }, $this->ticketDetails['seats']->toArray()));

        // Tạo và lưu file SVG
        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
        $qrCodePath = storage_path('app/public/qr_code_' . $this->booking->id . '.png');
        file_put_contents($qrCodePath, file_get_contents($qrUrl));
        $attachment = \Illuminate\Mail\Mailables\Attachment::fromPath($qrCodePath)
            ->as('qr_code.png')
            ->withMime('image/png');

        // Xóa file tạm sau khi gửi
        register_shutdown_function(function () use ($qrCodePath) {
            @unlink($qrCodePath);
        });
        return [$attachment];
    }
}
