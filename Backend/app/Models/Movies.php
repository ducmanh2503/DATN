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
        'director_id',
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

    public function actors()
    {
        return $this->belongsToMany(Actor::class, 'movie_actor');
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'movie_genre');
    }

    public function directors()
    {
        return $this->belongsTo(Director::class);
    }

    public function showTimes()
    {
        return $this->hasMany(ShowTime::class);
    }
}
