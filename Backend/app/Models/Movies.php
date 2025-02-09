<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movies extends Model
{
    use HasFactory;
    use SoftDeletes; // Kích hoạt tính năng xóa mềm

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

    protected $dates = ['deleted_at']; // là cột chứa thời gian xóa mềm
}
