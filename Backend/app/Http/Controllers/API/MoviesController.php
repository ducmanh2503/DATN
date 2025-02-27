<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Movies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MoviesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        if (!Gate::allows('isAdmin')) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        //Hiển thị tất cả phim
        $movies = Movies::query()->latest('id')->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();


        //Hiển thị phim sắp chiếu
        $coming_soon = Movies::where('movie_status', 'coming_soon')->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();

        //Hiển thị phim đang chiếu
        $now_showing = Movies::where('movie_status', 'now_showing')->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();

        // Hiển thị phim đã bị xóa mềm
        $trashedMovies = Movies::onlyTrashed()->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->get();

        return response()->json([
            'movies' => $movies,
            'coming_soon' => $coming_soon,
            'now_showing' => $now_showing,
            'trashed_movies' => $trashedMovies,
        ], 200);
    }

    public function store(Request $request)
    {

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255|unique:movies,title',
            'director_id' => 'required|exists:directors,id',
            'release_date' => 'required|date_format:Y-m-d',
            'running_time' => 'required|string',
            'language' => 'required|string|max:100',
            'rated' => 'required|string|max:255',
            'description' => 'nullable|string|unique:movies,trailer',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'trailer' => 'nullable|string',
            'movie_status' => 'required|in:coming_soon,now_showing',
            'name_actors' => 'required|array',
            'name_genres' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }
        // Tìm id của diễn viên từ tên
        $actorIds = DB::table('actors')->whereIn('name_actor', $request->name_actors)->pluck('id')->toArray();

        // Tìm id của thể loại từ tên
        $genreIds = DB::table('genres')->whereIn('name_genre', $request->name_genres)->pluck('id')->toArray();

        // Nếu không tìm thấy diễn viên
        if (count($actorIds) != count($request->name_actors)) {
            return response()->json(['message' => 'Không tìm thấy diễn viên'], 404);
        }

        // Nếu không tìm thấy thể loại
        if (count($genreIds) != count($request->name_genres)) {
            return response()->json(['message' => 'Không tìm thấy thể loại'], 404);
        }

        // Lấy dữ liệu phim hợp lệ từ request
        $movieData = $request->all();

        // Xử lý upload poster nếu có
        if (isset($movieData['poster']) && $movieData['poster'] instanceof \Illuminate\Http\UploadedFile) {
            $posterPath = $movieData['poster']->store('image', 'public');
            $movieData['poster'] = Storage::url($posterPath);
        }

        // Chuẩn bị dữ liệu để chèn vào database
        $movieToInsert = [
            'title' => $movieData['title'],
            'director_id' => $movieData['director_id'], // check it
            'release_date' => $movieData['release_date'],
            'running_time' => $movieData['running_time'],
            'language' => $movieData['language'],
            'rated' => $movieData['rated'],
            'description' => $movieData['description'] ?? null,
            'poster' => $movieData['poster'] ?? null,
            'trailer' => $movieData['trailer'] ?? null,
            'movie_status' => $movieData['movie_status'],
        ];

        // Thêm phim
        $movie = Movies::query()->create($movieToInsert);

        // Thêm diễn viên và thể loại cho phim
        $movie->actors()->sync($actorIds);
        $movie->genres()->sync($genreIds);

        return response()->json(['message' => 'Thêm phim thành công', 'data' => $movie], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        //Tìm phim theo id và lấy thông tin liên quan (Actors, Genres, Director)
        $movie = Movies::with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->find($id);

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

    public function showMovieDestroy(string $id)
    {

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        //Tìm phim theo id và lấy thông tin liên quan (Actors, Genres, Director)
        $movie = Movies::onlyTrashed()->with(['genres:id,name_genre', 'actors:id,name_actor', 'directors:id,name_director'])->find($id);

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

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

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
            'title' => 'required|string|max:255|unique:movies,title,' . $id,
            'director_id' => 'required|exists:directors,id',
            'release_date' => 'required|date_format:Y-m-d',
            'running_time' => 'required|integer',
            'language' => 'required|string|max:100',
            'rated' => 'required|string|max:255',
            'description' => 'nullable|string|unique:movies,trailer',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'trailer' => 'nullable|string',
            'movie_status' => 'required|in:coming_soon,now_showing',
            'name_actors' => 'required|array',
            'name_genres' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $movieData = $request->all();

        //Xủ lý upload poster nếu có
        if (isset($movieData['poster']) && $movieData['poster'] instanceof \Illuminate\Http\UploadedFile) {
            $posterPath = $movieData['poster']->store('image', 'public');
            $movieData['poster'] = Storage::url($posterPath);
        }

        //Cập nhật thông tin phim
        $movie->update($movieData);

        //Tìm id của diễn viên từ tên
        if (isset($movieData['name_actors']) && is_array($movieData['name_actors'])) {
            $actorIds = DB::table('actors')->whereIn('name_actor', $movieData['name_actors'])->pluck('id')->toArray();

            // Nếu không tìm thấy diễn viên
            if (count($actorIds) != count($movieData['name_actors'])) {
                return response()->json(['message' => 'Không tìm thấy diễn viên'], 404);
            }

            // Cập nhật diễn viên cho phim
            $movie->actors()->sync($actorIds); // Xóa và thêm lại
        }

        // Tìm id của thể loại từ tên
        if (isset($movieData['name_genres']) && is_array($movieData['name_genres'])) {
            $genreIds = DB::table('genres')->whereIn('name_genre', $movieData['name_genres'])->pluck('id')->toArray();

            // Nếu không tìm thấy thể loại
            if (count($genreIds) != count($movieData['name_genres'])) {
                return response()->json(['message' => 'Không tìm thấy thể loại'], 404);
            }

            // Cập nhật thể loại cho phim
            $movie->genres()->sync($genreIds); // Xóa và thêm lại   
        }

        return response()->json([
            'message' => 'Cập nhật phim thành công',
            'data' => $movie,
        ], 200);
    }

    /**
     * Xóa mềm nhiều phim.
     */
    public function destroyMultiple(Request $request)
    {

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        $ids = $request->input('ids'); // Lấy danh sách id phim cần xóa

        // Nếu không có phim nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có phim nào được chọn'], 400);
        }

        //Xóa mềm các phim được chọn
        $deleted = Movies::whereIn('id', $ids)->delete();

        //Kiểm tra xem có phim nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Xóa phim thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy phim nào'], 404);
    }

    //Xóa mềm 1 phim
    public function destroy($id)
    {

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        try {
            // Tìm phim theo ID
            $movie = Movies::findOrFail($id);

            // Xóa phim
            $movie->delete();

            // Trả về phản hồi thành công
            return response()->json(['message' => 'Xóa phim thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi khi xóa phim: ' . $e->getMessage()], 500);
        }
    }


    public function restore($id)
    {

        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        $movie = Movies::onlyTrashed()->find($id);

        if (!$movie) {
            return response()->json(['message' => 'Không tìm thấy phim đã bị xóa'], 404);
        }

        $movie->restore(); // Khôi phục phim

        return response()->json(['message' => 'Khôi phục phim thành công'], 200);
    }

    //Xóa vĩnh viễn nhiều phim
    public function forceDeleteMultiple(Request $request)
    {


        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        $ids = $request->input('ids'); // Lấy danh sách id phim cần xóa

        // Nếu không có phim nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có phim nào được chọn'], 400);
        }

        //Xóa vĩnh viễn các phim được chọn
        $deleted = Movies::onlyTrashed()->whereIn('id', $ids)->forceDelete();

        //Kiểm tra xem có phim nào được xóa không
        if ($deleted) {
            return response()->json(['message' => 'Xóa vĩnh viễn phim thành công'], 200);
        }

        return response()->json(['message' => 'Không tìm thấy phim nào'], 404);
    }

    //Xóa vĩnh viễn 1 phim
    public function forceDeleteSingle($id)
    {


        // if (!Gate::allows('isAdmin')) {
        //     return response()->json(['message' => 'Không có quyền truy cập'], 403);
        // }

        // Tìm phim đã xóa mềm theo ID
        $movie = Movies::onlyTrashed()->find($id);

        // Kiểm tra nếu không tìm thấy phim
        if (!$movie) {
            return response()->json(['message' => 'Phim không tồn tại hoặc đã bị xóa vĩnh viễn'], 404);
        }

        // Xóa vĩnh viễn phim
        $movie->forceDelete();

        // Trả về phản hồi thành công
        return response()->json(['message' => 'Xóa vĩnh viễn phim thành công'], 200);
    }
}
