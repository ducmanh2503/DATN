<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMoviesRequest;
use App\Models\Movies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MoviesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $coming_soon = Movies::where('movie_status', 'coming_soon')->get();
        $now_showing = Movies::where('movie_status', 'now_showing')->get();
        return response()->json([
            'coming_soon' => $coming_soon,
            'now_showing' => $now_showing,
        ], 200);
    }

    public function store(StoreMoviesRequest $request)
    {
        $moviesData = $request->validated(); // Lấy danh sách phim hợp lệ

        //Kiểm tra dữ liệu phim có đúng kiểu mảng không
        if (!is_array($moviesData)) {
            return response()->json(['error' => 'Dữ liệu không đúng định dạng'], 400);
        }

        $moviesToInsert = []; //Mảng chứa dữ liệu phim để chèn vào database

        foreach ($moviesData as $data) {
            // Xử lý upload poster nếu có
            if (isset($data['poster']) && $data['poster'] instanceof \Illuminate\Http\UploadedFile) {
                $posterPath = $data['poster']->store('image', 'public');
                $data['poster'] = Storage::url($posterPath);
            }

            // Chuẩn bị dữ liệu để chèn vào database
            $moviesToInsert[] = [
                'title' => $data['title'],
                'director' => $data['director'],
                'actors' => $data['actors'],
                'genre' => $data['genre'],
                'duration' => $data['duration'],
                'time' => $data['time'],
                'language' => $data['language'],
                'rated' => $data['rated'],
                'trailer' => $data['trailer'] ?? null,
                'description' => $data['description'] ?? null,
                'poster' => $data['poster'] ?? null,
                'movie_status' => $data['movie_status'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        //Thêm phim
        Movies::insert($moviesToInsert);
        return response()->json(['message' => 'Thêm phim thành công', 'data' => $data], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //Tìm phim theo id
        $movie = Movies::findOrFail($id);

        //nếu không tìm thấy trả về 404
        if (!$movie) {
            return response()->json([
                'message' => 'Không tìm thấy phim này',
            ], 404);
        }

        //trả về chi tiết phim
        return response()->json([
            'message' => 'Thông tin chi tiết phim',
            'data' => $movie
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
