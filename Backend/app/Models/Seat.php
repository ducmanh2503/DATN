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

    //quan hệ với show_time_seats
    public function showTimeSeats()
    {
        return $this->hasMany(ShowTimeSeat::class);
    }


}
