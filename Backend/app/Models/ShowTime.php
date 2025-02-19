<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShowTime extends Model
{
    protected $fillable = ['movie_id', 'room_id', 'show_date', 'show_time'];

    // Quan hệ nhiều - một với model Movie
    public function movie()
    {
        return $this->belongsTo(Movies::class, 'movie_id');
    }

    // Quan hệ nhiều - một với model Room
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}
