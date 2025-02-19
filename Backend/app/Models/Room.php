<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'capacity',
        'room_type',
    ];

    public function seat()
    {
        return $this->hasMany(Seat::class);  // Một thể loại có nhiều phim
    }

    public function showTime()
    {
        return $this->hasMany(ShowTime::class);  // Một phòng có nhiều lịch chiếu
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($room) {
            $room->seats()->delete(); // Xóa mềm tất cả các ghế của phòng
        });
    }
}
