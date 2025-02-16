<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SeatType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
    ];

    //Quan hệ với ghế
    public function seat()
    {
        return $this->hasMany(Seat::class);
    }
}
