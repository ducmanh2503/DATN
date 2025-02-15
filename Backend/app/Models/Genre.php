<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    public function movies()
    {
        return $this->hasMany(Movies::class);  // Một thể loại có nhiều phim
    }
}
