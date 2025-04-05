<?php


namespace App\Http\Controllers\API;


use App\Http\Controllers\Controller;
use App\Models\CalendarShow;
use App\Models\Movies;
use App\Models\ShowTime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;


class CalendarShowController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {


        $calendarShows = CalendarShow::query()->latest('id')->with(['movie'])->get();


        return response()->json($calendarShows, 200);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'movie_id' => 'required|exists:movies,id',
            'show_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        // Thêm lịch chiếu
        $calendarShows = CalendarShow::create([
            'movie_id' => $request->movie_id,
            'show_date' => $request->show_date,
            'end_date' => $request->end_date,
        ]);

        // Lấy ngày hiện tại
        $currentDate = Carbon::today();

        // Kiểm tra và cập nhật trạng thái phim
        $movie = Movies::find($request->movie_id);
        if ($movie && $movie->movie_status === 'coming_soon' && Carbon::parse($request->show_date)->lte($currentDate)) {
            $movie->update(['movie_status' => 'now_showing']);
        }

        return response()->json([
            'message' => 'Lịch chiếu đã được thêm thành công',
            'data' => $calendarShows
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {


        $calendarShows = CalendarShow::with(['movie'])->find($id);


        if (!$calendarShows) {
            return response()->json(['message' => 'Lịch chiếu không tồn tại'], 404);
        }


        return response()->json($calendarShows);
    }


    public function showClient(Request $request)
    {
        $movie_id = $request->input('movie_id');


        if (!$movie_id) {
            return response()->json(['message' => 'Thiếu movie_id'], 400);
        }


        $calendarShow = CalendarShow::with(['movie'])->where('movie_id', $movie_id)->first();


        if (!$calendarShow) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu cho phim này'], 404);
        }


        return response()->json($calendarShow);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {


        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'show_date' => 'required|date',
            'end_date' => 'required|date',
        ]);


        $calendarShows = CalendarShow::find($id);


        if (!$calendarShows) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu'], 404);
        }


        $calendarShows->update($validated);


        return response()->json([
            'message' => 'Cập nhật lịch chiếu thành công',
            'data' => $calendarShows
        ]);
    }


    /**
     * Remove the specified resource from storage (soft delete).
     */
    public function destroy(string $id)
    {
        try {
            // Tìm lịch chiếu theo ID
            $calendarShow = CalendarShow::find($id);

            // Nếu không tìm thấy lịch chiếu
            if (!$calendarShow) {
                return response()->json(['message' => 'Không tìm thấy lịch chiếu'], 404);
            }

            // Kiểm tra xem lịch chiếu có suất chiếu liên quan không
            $hasShowtimes = ShowTime::where('calendar_show_id', $id)->exists();

            if ($hasShowtimes) {
                return response()->json([
                    'message' => 'Không thể xóa lịch chiếu vì lịch chiếu đang có suất chiếu'
                ], 400);
            }

            // Xóa lịch chiếu
            $calendarShow->delete();

            // Trả về phản hồi thành công
            return response()->json([
                'message' => 'Lịch chiếu đã được gỡ'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi xóa lịch chiếu: ' . $e->getMessage()
            ], 500);
        }
    }


    //lấy tất cả các ngày mà phim đó có lịch chiếu
    public function getShowDates(Request $request, string $movie_id)
    {
        // Kiểm tra movie_id có tồn tại không
        if (!Movies::where('id', $movie_id)->exists()) {
            return response()->json(['error' => 'Phim không tồn tại'], 404);
        }


        // Lấy ngày hiện tại
        $today = now()->toDateString();


        // Tìm lịch chiếu của phim
        $calendarShow = CalendarShow::where('movie_id', $movie_id)
            ->where('end_date', '>=', $today) // Loại bỏ lịch đã kết thúc
            ->selectRaw('MIN(show_date) as start_date, MAX(end_date) as end_date')
            ->first();


        if (!$calendarShow || !$calendarShow->start_date || !$calendarShow->end_date) {
            return response()->json(['message' => 'Không tìm thấy lịch chiếu cho phim này'], 404);
        }


        // Chỉ lấy từ hôm nay trở đi
        $startDate = new \DateTime(max($calendarShow->start_date, $today));
        $endDate = new \DateTime($calendarShow->end_date);
        $dates = [];


        while ($startDate <= $endDate) {
            $dates[] = $startDate->format('Y-m-d');
            $startDate->modify('+1 day');
        }


        return response()->json([
            'movie_id' => $movie_id,
            'show_dates' => $dates
        ]);
    }
}
