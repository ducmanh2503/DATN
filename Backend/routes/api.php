<?php




use App\Http\Controllers\API\ActorController;
use App\Http\Controllers\API\ArticleController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CalendarShowController;
use App\Http\Controllers\API\CartItemController;
use App\Http\Controllers\API\ComboController;
use App\Http\Controllers\API\DirectorController;
use App\Http\Controllers\API\DiscountCodeController;
use App\Http\Controllers\API\GenreController;
use App\Http\Controllers\API\MoviesController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\RoomController;
use App\Http\Controllers\API\RoomTypeController;
use App\Http\Controllers\API\SeatController;
use App\Http\Controllers\API\SeatTypeController;
use App\Http\Controllers\API\ShowTimeController;
use App\Http\Controllers\API\SocialAuthController;
use App\Http\Controllers\API\StatisticsController;
use App\Http\Controllers\API\TicketController;
use App\Http\Controllers\API\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;




/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {

    // Lấy thông tin user đã đăng nhập
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });




    //thông tin và cập nhật khách hàng
    Route::get('/show-user-locked', [UserController::class, 'showUserDestroy']);
    Route::put('/update-profile', [UserController::class, 'updateProfile']);
    Route::post('/change-password', [UserController::class, 'changePassword']);

    //Lịch sử giao dịch
    Route::get('/orders-search', [OrderController::class, 'searchOrders']); // Tìm kiếm giao dịch
    Route::get('/orders-recent', [OrderController::class, 'recentOrders']); // Lấy danh sách giao dịch gần đây (20 giao dịch gần nhất)
    Route::get('/orders-confirmed', [OrderController::class, 'confirmedOrders']); // Lấy danh sách tất cả giao dịch đã hoàn tất

    //Áp dụng mã giảm giá
    Route::post('/apply-discount-code', [DiscountCodeController::class, 'applyDiscountCode']);

    //thanh toán VNPay
    Route::post('/VNPay/create', [PaymentController::class, 'createVNPay']);

    //Sơ đồ ghế, giữ ghế, giải phóng ghế
    Route::get('/get-seats-for-booking/{room_id}/{show_time_id}', [SeatController::class, 'getSeatsForBooking']);
    Route::post('/hold-seats', [SeatController::class, 'holdSelectedSeats']);
    Route::post('/release-seats', [SeatController::class, 'releaseSeat']);

    // Chỉ admin mới truy cập được
    Route::middleware(['role:admin'])->group(function () {
        // Thống kê
        Route::get('/statistics', [StatisticsController::class, 'index']);
        Route::get('/statistics-filter', [StatisticsController::class, 'statsByDateRange']);
        //xuất file excel
        // Route::get('/export-stats-by-date-range', [StatisticsController::class, 'exportStatsByDateRange']);
        // Movies
        Route::apiResource('movies', MoviesController::class);
        Route::delete('/movies/force-delete/{movie}', [MoviesController::class, 'forceDeleteSingle']);
        Route::delete('/movies', [MoviesController::class, 'destroyMultiple']);
        Route::delete('/movies/force-delete-multiple', [MoviesController::class, 'forceDeleteMultiple']);
        Route::put('/movies/restore/{movie}', [MoviesController::class, 'restore']);
        Route::get('/movies/show-movie-destroy/{movie}', [MoviesController::class, 'showMovieDestroy']);

        // Room
        Route::apiResource('/room', RoomController::class);

        //room_type
        Route::apiResource('/room-type', RoomTypeController::class);

        // Seats
        Route::apiResource('/seats', SeatController::class);
        Route::get('/seats/room/{room_id}', [SeatController::class, 'getSeats']);
        Route::post('/seats/update-status', [SeatController::class, 'updateSeatStatus']);
        Route::delete('/delete-seats/room/{room_id}', [SeatController::class, 'deleteAll']);

        //seat_type
        Route::get('/seat-type', [SeatTypeController::class, 'index']);




        // Showtimes
        Route::apiResource('showTime', ShowTimeController::class);
        Route::post('show-times/in-range', [ShowTimeController::class, 'getShowTimesInDateRange']); //danh sách ngày
        Route::post('show-times/by-date', [ShowTimeController::class, 'getShowTimesByDate']); //lọc theo ngày cụ thể




        // lọc theo khoảng ngày
        Route::post('show-times/get-date-range-by-calendar', [ShowTimeController::class, 'getDateRangeByCalendarShow']);
        //xóa theo ngày cụ thể
        Route::delete('/showtimes/{id}/destroy-by-date/{selected_date}', [ShowTimeController::class, 'destroyByDate']);




        // CalendarShow
        Route::apiResource('/calendarShow', CalendarShowController::class);




        // Combo
        Route::apiResource('combo', ComboController::class);
        Route::delete('/combo', [ComboController::class, 'destroyMultiple']);
        Route::delete('/combos/force-delete-multiple', [ComboController::class, 'forceDeleteMultiple']);
        Route::delete('/combo/force/{combo}', [ComboController::class, 'forceDeleteSingle']);
        Route::post('/combo/restore/{combo}', [ComboController::class, 'restore']);
        Route::post('/combo/multiple/restore', [ComboController::class, 'restoreMultiple']);

        //Vé
        Route::get('/ticket-management', [TicketController::class, 'index']);
        Route::get('/ticket-show/{id}', [TicketController::class, 'show']);
        Route::delete('/ticket-delete/{id}', [TicketController::class, 'destroy']);

        // Thể loại phim, Diễn viên, Đạo diễn
        Route::apiResource('/genres', GenreController::class);
        Route::apiResource('/actors', ActorController::class);
        Route::apiResource('/directors', DirectorController::class);

        //Mã khuyến mãi
        Route::apiResource('/discount-code', DiscountCodeController::class);
        //Bài viết
        Route::apiResource('/article', ArticleController::class);

        //người dùng
        Route::apiResource('/user-management', UserController::class);
        Route::get('/user-management/profile/{user_management}', [UserController::class, 'show']);
        Route::put('/user-management/restore/{user_management}', [UserController::class, 'restore']);
        Route::get('/user-management/show-user-destroy/{user_management}', [UserController::class, 'showUserDestroy']);
        Route::post('/restore-user', [UserController::class, 'restore']);
        Route::get('/user/rank-points', [UserController::class, 'getUserRankAndPoints']);
        Route::post('/user-management/search/email', [UserController::class, 'searchByEmail']);
        Route::post('/user-management/search/name', [UserController::class, 'searchByName']);

        //Đơn hàng
        Route::get('/order', [OrderController::class, 'index']);
        Route::get('/order/{bookingId}/order-details', [OrderController::class, 'show']);
    });
    // Đăng xuất
    Route::post('/logout', [AuthController::class, 'logout']);
});
Route::get('/VNPay/return', [PaymentController::class, 'VNPayReturn']);
Route::get('/export-stats-by-date-range', [StatisticsController::class, 'exportStatsByDateRange']);


///////////////////////////////////////////////customer///////////////////////////////////////////////

//movie, calendar_show, showTime
Route::get('/movies-ranking', [MoviesController::class, 'moviesRanking']); // Xếp hạng phim
Route::get('/movies-index', [MoviesController::class, 'index']);
Route::get('/movies-details/{movies}', [MoviesController::class, 'show']);
Route::get('/movies/{movieId}/related', [MoviesController::class, 'relatedMovies']); // Phim cùng thể loại
Route::get('/movies-for-client', [MoviesController::class, 'getMoviesForClient']); // Lấy danh sách phim cho client
Route::get('/search', [MoviesController::class, 'searchMovies']); // Tìm kiếm phim
Route::get('/filter', [MoviesController::class, 'filterMovies']); // Lọc phim theo nhiều tiêu chí
Route::get('/showtimes-client/by-date/{movie_id}/{date}', [ShowTimeController::class, 'getShowTimesByDateClient']);
Route::post('/calendar-show/movie', [CalendarShowController::class, 'showClient']);
Route::get('/calendar-show/date-range/{movie_id}', [CalendarShowController::class, 'getShowDates']);
Route::get('/movie-details-booking/{movie}', [MoviesController::class, 'show']);

//bài viết
Route::get('/articles-client', [ArticleController::class, 'index']);
Route::get('/articles/{article}/client', [ArticleController::class, 'show']);


//combo
Route::get('/combos', [ComboController::class, 'showCombosForClient']);

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/resend-verification', [AuthController::class, 'resendVerificationEmail']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/login', [AuthController::class, 'login'])->name('api.login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected customer routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/ticket-details', [TicketController::class, 'getTicketDetails']);
    Route::post('/cart/add-seat', [CartItemController::class, 'addSeatToCart']);
    Route::post('/cart/add-showtime', [CartItemController::class, 'addShowtimeToBooking']);
    Route::post('/cart/checkout', [CartItemController::class, 'checkout']);
});

// Đăng nhập bằng Google & Facebook
Route::get('auth/google', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
