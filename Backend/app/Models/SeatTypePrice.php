<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class SeatTypePrice extends Model
{
    use HasFactory;

    protected $table = 'seat_type_price';


    protected $fillable = [
        'seat_type_id',
        'price',
        'day_type',
    ];

    public function seatType()
    {
        return $this->belongsTo(SeatType::class, 'seat_type_id');
    }

    //Lấy giá của loại ghế
    //  public function getPriceAttribute()
    // {
    //     // Trả về giá theo thuộc tính 'price'
    //     return $this->attributes['price'] ?? 0;
    // }

    // // Nếu bạn muốn xác định giá theo 'day_type' (ví dụ: ngày lễ, ngày thường, v.v...)
    // public function getPriceByDayType($dayType)
    // {
    //     if ($this->day_type == $dayType) {
    //         return $this->price;
    //     }

    //     return 0;  // Trả về 0 nếu không khớp với day_type
    // }

    //////////////---------------------carbon-----------------/////////////////////

    /**
     * Xác định loại ngày: ngày thường, cuối tuần, ngày lễ
     */
    public static function getDayType($date)
    {
        $date = Carbon::parse($date);

        if ($date->isWeekend()) {
            return 'weekend';
        }

        // Danh sách ngày lễ (có thể lấy từ DB)
        $holidays = ['2025-01-01', '2025-04-30', '2025-05-01', '2025-09-02'];
        if (in_array($date->toDateString(), $holidays)) {
            return 'holiday';
        }

        return 'weekday';
    }

    /**
     * Lấy giá vé theo ngày cụ thể
     */
    public static function getPriceByDate($seatTypeId, $date)
    {
        $dayType = self::getDayType($date);

        return self::where('seat_type_id', $seatTypeId)
            ->where('day_type', $dayType)
            ->value('price'); // Trả về giá hoặc null nếu không có
    }
    //////////////---------------------end-carbon-----------------/////////////////////


    //////////////---------------------carbon V2-----------------/////////////////////

    // public static function getDayType($date)
    // {
    //     // Chuyển đổi chuỗi ngày thành đối tượng Carbon
    //     $date = Carbon::parse($date);

    //     // Kiểm tra nếu ngày là cuối tuần (thứ 7 hoặc chủ nhật)
    //     if ($date->isWeekend()) {
    //         return 'weekend';
    //     }

    //     // Bạn có thể gọi một API từ server hoặc kiểm tra với Pusher để xác định ngày lễ (nếu có)
    //     // Ví dụ: Lấy danh sách ngày lễ từ API hoặc event từ Pusher (hoặc cơ sở dữ liệu của bạn)
    //     $holidays = self::getHolidays();  // Giả sử bạn có phương thức để lấy danh sách ngày lễ từ DB hoặc API

    //     // Nếu ngày trùng với một trong các ngày lễ
    //     if (in_array($date->toDateString(), $holidays)) {
    //         return 'holiday';
    //     }

    //     // Nếu không phải cuối tuần và không phải ngày lễ, mặc định là ngày thường
    //     return 'weekday';
    // }

    // // Phương thức giả sử để lấy danh sách ngày lễ từ cơ sở dữ liệu hoặc từ API
    // public static function getHolidays()
    // {
    //     // Ví dụ lấy danh sách ngày lễ từ cơ sở dữ liệu hoặc một nguồn dữ liệu động
    //     // Có thể tích hợp API Pusher hoặc từ DB để lấy thông tin về ngày lễ theo thời gian thực
    //     return [
    //         '2025-01-01',
    //         '2025-04-30',
    //         '2025-05-01',
    //         '2025-09-02' // Ngày lễ mẫu
    //     ];
    // }

    //////////////---------------------end-carbon V2-----------------/////////////////////

    public function getFormattedPriceAttribute()
    {
        return ($this->price == floor($this->price)) ? number_format($this->price, 0) : number_format($this->price, 2);
    }
}
