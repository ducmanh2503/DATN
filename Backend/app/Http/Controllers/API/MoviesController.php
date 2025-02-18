<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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
        $perPage = request()->input('per_page', 15);


        //Hiển thị phim sắp chiếu
        $coming_soon = Movies::where('movie_status', 'coming_soon')->with(['genre:id,name_genre'])->paginate($perPage);

        //Hiển thị phim đang chiếu
        $now_showing = Movies::where('movie_status', 'now_showing')->with(['genre:id,name_genre'])->paginate($perPage);

        // Hiển thị phim đã bị xóa mềm
        $trashedMovies = Movies::onlyTrashed()->with(['genre:id,name_genre'])->paginate($perPage);

        return response()->json([
            'coming_soon' => $coming_soon,
            'now_showing' => $now_showing,
            'trashed_movies' => $trashedMovies,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            '*.title' => 'required|string|max:255|unique:movies,title',
            '*.directors' => 'required|string|max:255',
            '*.actors' => 'required|string',
            '*.release_date' => 'required|date_format:Y-m-d',
            '*.running_time' => 'required|string',
            '*.language' => 'required|string|max:100',
            '*.rated' => 'required|string|max:255',
            '*.description' => 'nullable|string|unique:movies,trailer',
            '*.poster' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
            '*.trailer' => 'nullable|string',
            '*.movie_status' => 'required|in:coming_soon,now_showing',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $moviesData = $request->all(); // Lấy danh sách phim hợp lệ

        // Kiểm tra nếu request có file poster được upload
        if ($request->hasFile('poster')) {
            // Lưu file vào thư mục storage/app/public/images và lấy đường dẫn
            $posterPath = $request->file('poster')->store('images', 'public');
            // Lưu đường dẫn đầy đủ để truy cập ảnh sau này
            $data['poster'] = Storage::url($posterPath);
        }

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
                'directors' => $data['directors'],
                'actors' => $data['actors'],
                'genre_id' => $data['genre_id'],
                'release_date' => $data['release_date'],
                'running_time' => $data['running_time'],
                'language' => $data['language'],
                'rated' => $data['rated'],
                'description' => $data['description'] ?? null,
                'poster' => $data['poster'] ?? null,
                'trailer' => $data['trailer'] ?? null,
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
            'directors' => 'required|string|max:255',
            'actors' => 'required|string',
            'release_date' => 'required|date_format:Y-m-d',
            'running_time' => 'required|string',
            'language' => 'required|string|max:100',
            'rated' => 'required|string|max:255',
            'description' => 'nullable|string',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'trailer' => 'nullable|string|unique:movies,trailer',
            'movie_status' => 'required|in:coming_soon,now_showing',
            'genre_id' => 'required|exists:genres,id',
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
     * Xóa mềm nhiều phim.
     */
    public function destroyMultiple(Request $request)
    {
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
    public function destroySingle($id)
    {
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
        $ids = $request->input('ids'); // Lấy danh sách id phim cần xóa

        // Nếu không có phim nào được chọn
        if (empty($ids)) {
            return response()->json(['message' => 'Không có phim nào được chọn'], 400);
        }

        //Xóa mềm các phim được chọn
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
