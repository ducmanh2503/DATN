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
                return "{$combo['name']} ({$combo['price']})";
            }, $this->ticketDetails['combos']->toArray()));
        }
        $qrData = "Mã đặt vé: {$this->booking->id}\n" .
            "Phim: {$this->ticketDetails['movie']['title']}\n" .
            "Ngày chiếu: {$this->ticketDetails['calendar_show']['show_date']}\n" .
            "Giờ chiếu: {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}\n" .
            "Phòng: {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})\n" .
            "Ghế: {$seats}";

        // Tạo QR code dưới dạng base64 để nhúng vào email
        $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($qrData);
        $qrCode = base64_encode(file_get_contents($qrUrl));
        Log::info('QR Code Base64 (Mail): ' . $qrCode);


        return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <title>Xác nhận đặt vé</title>
    </head>
    <body>
        <h1>Xác nhận đặt vé thành công</h1>
        <p>Cảm ơn bạn đã đặt vé tại hệ thống của chúng tôi!</p>

        <h2>Thông tin vé</h2>
        <p><strong>Phim:</strong> {$this->ticketDetails['movie']['title']}</p>
        <p><strong>Ngày chiếu:</strong> {$this->ticketDetails['calendar_show']['show_date']}</p>
        <p><strong>Giờ chiếu:</strong> {$this->ticketDetails['show_time']['start_time']} - {$this->ticketDetails['show_time']['end_time']}</p>
        <p><strong>Phòng:</strong> {$this->ticketDetails['show_time']['room']['name']} ({$this->ticketDetails['show_time']['room']['room_type']})</p>
        <p><strong>Ghế:</strong> {$seats}</p>
        <p><strong>Combo:</strong> {$combos}</p>
        <p><strong>Tổng giá vé:</strong> {$this->ticketDetails['pricing']['total_ticket_price']}</p>
        <p><strong>Tổng giá combo:</strong> {$this->ticketDetails['pricing']['total_combo_price']}</p>
        <p><strong>Tổng cộng:</strong> {$this->ticketDetails['pricing']['total_price']}</p>
        <p><strong>Phương thức thanh toán:</strong> {$this->ticketDetails['payment_method']}</p>
        <p><strong>Mã đặt vé:</strong> {$this->booking->id}</p>

        <h2>QR Code vé của bạn</h2>
        <img src="data:image/png;base64,{$qrCode}" alt="QR Code">
        <p>File QR code cũng được đính kèm dưới dạng PNG để bạn tải về nếu cần.</p>

        <p>Vui lòng giữ mã đặt vé hoặc QR code để kiểm tra tại rạp.</p>
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
