<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShowTimeSeat extends Model
{
    use HasFactory;

    protected $fillable = [
        'show_time_id',
        'seat_id',
        'seat_status',
    ];

    public function showTime()
    {
        return $this->belongsTo(ShowTime::class);
    }

    // Quan hệ với bảng Seat
    public function seat()
    {
        return $this->belongsTo(Seat::class);
    }

    // Lấy tình trạng ghế (seat_status) nếu cần
    public function getSeatStatusAttribute($value)
    {
        return ucfirst($value);  
    }
}
