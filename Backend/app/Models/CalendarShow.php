<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarShow extends Model
{
    use HasFactory;

    protected $table = 'calendar_show';

    protected $fillable = [
        'movie_id',
        'show_date',
        'end_date',
    ];

    protected $dates = ['show_date', 'end_date'];

    public function movie()
    {
        return $this->belongsTo(Movies::class, 'movie_id', 'id');
    }

    public function showTimes()
    {
        return $this->hasMany(ShowTime::class, 'calendar_show_id');
    }

    public function showTimeDates()
    {
        return $this->hasManyThrough(ShowTimeDate::class, ShowTime::class);
    }
}
