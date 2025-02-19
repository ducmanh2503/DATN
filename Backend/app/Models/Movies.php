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
        'directors',
        'actors',
        'genre_id',
        'release_date',
        'running_time',
        'language',
        'rated',
        'description',
        'poster',
        'trailer',
        'movie_status',
    ];

    protected $dates = ['deleted_at']; // là cột chứa thời gian xóa mềm

    public function genre()
    {
        return $this->belongsTo(Genre::class);  // Đảm bảo rằng Genre là model thể loại (genre)
    }

    public function showTime()
    {
        return $this->hasMany(ShowTime::class);  // Một phim có nhiều lịch chiếu
    }
}
