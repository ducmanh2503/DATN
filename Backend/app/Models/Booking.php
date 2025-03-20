<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'showtime_id',
        'total_ticket_price',
        'total_combo_price',
        'discount_code_id',
        'status',
    ];

    //quan hệ n-1 với bảng DiscountCode
    public function discountCode()
    {
        return $this->belongsTo(DiscountCode::class, 'discount_code_id');
    }

    //quan hệ n-1 với bảng User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    //quan hệ n-1 với bảng ShowTime
    public function showtime()
    {
        return $this->belongsTo(ShowTime::class, 'showtime_id');
    }

    //quan hệ 1-n với bảng BookingDetail
    public function bookingDetails()
    {
        return $this->hasMany(BookingDetail::class, 'booking_id');
    }
}
