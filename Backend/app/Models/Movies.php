<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movies extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'director',
        'actors',
        'genre',
        'duration',
        'time',
        'language',
        'rated',
        'trailer',
        'description',
        'poster',
        'movie_status',
    ];
}
