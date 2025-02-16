<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShowTime extends Model
{
    use HasFactory;

    protected $fillable = [
        'movie_id',
        'room_id',
        'show_date',
        'show_time'
    ];

    public function movie()
    {
        return $this->belongsTo(Movies::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
