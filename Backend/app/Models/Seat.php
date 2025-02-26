<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Seat extends Model
{
    use HasFactory;
    // use SoftDeletes;

    protected $fillable = [
        'room_id',
        'row',
        'column',
        'seat_type_id',
        'seat_status',
    ];

    //Quan hệ với phòng chiếu
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    //Quan hệ với loại ghế
    public function seatType()
    {
        return $this->belongsTo(SeatType::class);
    }

    //Lấy giá của loại ghế
    public function getPriceAttribute()
    {
        return $this->seatType ? $this->seatType->price : 0;
    }
}
