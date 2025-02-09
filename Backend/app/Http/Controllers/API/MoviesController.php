<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMoviesRequest;
use App\Http\Requests\UpdateMoviesRequest;
use App\Models\Movies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MoviesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //Hiển thị phim sắp chiếu
        $coming_soon = Movies::where('movie_status', 'coming_soon')->get();

        //Hiển thị phim đang chiếu
        $now_showing = Movies::where('movie_status', 'now_showing')->get();

        // Hiển thị phim đã bị xóa mềm
        $trashedMovies = Movies::onlyTrashed()->get();

        return response()->json([
            'coming_soon' => $coming_soon,
            'now_showing' => $now_showing,
            'trashed_movies' => $trashedMovies,
        ], 200);
    }

    public function store(StoreMoviesRequest $request)
    {
        $validator = Validator::make($request->all(), [
            '*.title' => 'required|string|max:255|unique:movies,title',
            '*.director' => 'required|string|max:255',
            '*.actors' => 'required|string',
            '*.genre' => 'required|string|max:100',
            '*.duration' => 'required|date_format:Y-m-d',
            '*.time' => 'required|integer',
            '*.language' => 'required|string|max:100',
            '*.rated' => 'required|string|max:255',
            '*.trailer' => 'nullable|string|unique:movies,trailer',
            '*.description' => 'nullable|string',
            '*.poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            '*.movie_status' => 'required|in:coming_soon,now_showing',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $moviesData = $request->all(); // Lấy danh sách phim hợp lệ

        // Nếu chỉ có 1 phim, đảm bảo dữ liệu là mảng của mảng
        if (!isset($moviesData[0])) {
            $moviesData = [$moviesData];
        }

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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //Tìm phim theo id
        $movie = Movies::find($id);

        //Nếu không tìm thấy phim trả về 404
        if (!$movie) {
            return response()->json([
                'message' => 'Không tìm thấy phim này',
            ], 404);
        }

        //Lấy dữ liệu phim hợp lệ từ request
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:movies,title',
            'director' => 'required|string|max:255',
            'actors' => 'required|string',
            'genre' => 'required|string|max:100',
            'duration' => 'required|date_format:Y-m-d',
            'time' => 'required|integer',
            'language' => 'required|string|max:100',
            'rated' => 'required|string|max:255',
            'trailer' => 'nullable|string|unique:movies,trailer',
            'description' => 'nullable|string',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'movie_status' => 'required|in:coming_soon,now_showing',
        ]);

        if ($validator->fails()) {
            return response()->json(
                ['error' => $validator->errors()],
                422
            );
        }

        $moviesData = $request->all();

        //Xủ lý upload poster nếu có
        if (isset($moviesData['poster']) && $moviesData['poster'] instanceof \Illuminate\Http\UploadedFile) {
            $posterPath = $moviesData['poster']->store('image', 'public');
            $moviesData['poster'] = Storage::url($posterPath);
        }

        //Cập nhật thông tin phim
        $movie->update($moviesData);

        return response()->json([
            'message' => 'Cập nhật phim thành công',
            'data' => $movie,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $movie = Movies::find($id);

        if (!$movie) {
            return response()->json(['message' => 'Không tìm thấy phim'], 404);
        }

        $movie->delete(); // Xóa mềm (không xóa khỏi database)

        return response()->json(['message' => 'Xóa mềm phim thành công'], 200);
    }

    public function restore($id)
    {
        $movie = Movies::onlyTrashed()->find($id);

        if (!$movie) {
            return response()->json(['message' => 'Không tìm thấy phim đã bị xóa'], 404);
        }

        $movie->restore(); // Khôi phục phim

        return response()->json(['message' => 'Khôi phục phim thành công'], 200);
    }

    public function forceDelete($id)
    {
        $movie = Movies::onlyTrashed()->find($id);

        if (!$movie) {
            return response()->json(['message' => 'Không tìm thấy phim đã bị xóa'], 404);
        }

        $movie->forceDelete(); // Xóa vĩnh viễn khỏi database

        return response()->json(['message' => 'Xóa vĩnh viễn phim thành công'], 200);
    }
}
