<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\ShowTimeDate;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        $bookings = Booking::query()
            ->latest('id')
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'check_in',
                'created_at'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;
                // Khai báo $show_date với giá trị mặc định
                $show_date = 'N/A'; // Giá trị mặc định nếu không tìm thấy show_date

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                if ($booking->showtime && $booking->showtime->showTimeDate) {
                    $showTimeDate = $booking->showtime->showTimeDate instanceof \Illuminate\Support\Collection
                        ? $booking->showtime->showTimeDate->first()
                        : $booking->showtime->showTimeDate;

                    if ($showTimeDate && $showTimeDate->show_date) {
                        // Chuyển show_date thành đối tượng Carbon và định dạng
                        try {
                            $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                        } catch (\Exception $e) {
                            // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                            $show_date = $showTimeDate->show_date ?: 'N/A';
                        }
                    }
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => $detail->quantity,
                                'price' => $detail->price,
                            ];
                        }
                    }
                }

                return [
                    'id' => $booking->id,
                    'customer_name' => $booking->user->name ?? 'N/A',
                    'phone' => $booking->user->phone ?? 'N/A',
                    'email' => $booking->user->email ?? 'N/A',
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    'show_date' => $show_date, // $show_date đã được đảm bảo có giá trị
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => $booking->total_ticket_price,
                    'total_combo_price' => $booking->total_combo_price,
                    'total_price' => $booking->total_price,
                    'status' => $booking->status,
                    'check_in' => $booking->check_in,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Danh sách đơn hàng',
            'data' => $bookings,
        ]);
    }

    public function show($bookingId)
    {
        $booking = Booking::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'check_in',
                'created_at'
            )
            ->find($bookingId);

        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
        $seats = [];
        $room_name = null;
        $room_type = null;
        $combos = [];
        $movie = null;
        $show_date = 'N/A'; // Khai báo giá trị mặc định cho $show_date

        // Lấy thông tin phim từ showtime -> calendarShow -> movie
        if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
            $movie = [
                'id' => $booking->showtime->calendarShow->movie->id,
                'title' => $booking->showtime->calendarShow->movie->title,
                'poster' => $booking->showtime->calendarShow->movie->poster,
            ];
        }

        // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
        if ($booking->showtime && $booking->showtime->showTimeDate) {
            $showTimeDate = $booking->showtime->showTimeDate instanceof \Illuminate\Support\Collection
                ? $booking->showtime->showTimeDate->first()
                : $booking->showtime->showTimeDate;

            if ($showTimeDate && $showTimeDate->show_date) {
                try {
                    $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                } catch (\Exception $e) {
                    $show_date = $showTimeDate->show_date ?: 'N/A';
                }
            }
        }

        if ($booking->bookingDetails) {
            foreach ($booking->bookingDetails as $detail) {
                if ($detail->seat) {
                    $seatName = "{$detail->seat->row}{$detail->seat->column}";
                    // Xác định loại ghế (seat_type) dựa trên room_type
                    $seatType = 'Thường'; // Mặc định là Thường
                    if ($detail->seat->room && $detail->seat->room->roomType) {
                        $roomTypeName = $detail->seat->room->roomType->name;
                        if (stripos($roomTypeName, 'VIP') !== false) {
                            $seatType = 'VIP';
                        } elseif (stripos($roomTypeName, 'Sweetbox') !== false) {
                            $seatType = 'Sweetbox';
                        }
                    }

                    $seats[] = [
                        'booking_detail_id' => $detail->id,
                        'seat_name' => $seatName,
                        'price' => (int) $detail->price,
                        'seat_type' => $seatType,
                    ];

                    // Lấy tên phòng và loại phòng
                    if ($detail->seat->room) {
                        $room_name = $detail->seat->room->name;
                        $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                    }
                }

                if ($detail->combo) {
                    $combos[] = [
                        'booking_detail_id' => $detail->id,
                        'combo_name' => $detail->combo->name,
                        'quantity' => (int) $detail->quantity,
                        'price' => (int) $detail->price,
                    ];
                }
            }
        }

        // Tính tổng tiền và giảm giá
        $totalPrice = (int) $booking->total_price;
        if ($totalPrice === 0) {
            $totalPrice = (int) ($booking->total_ticket_price + $booking->total_combo_price);
        }
        $discount = (int) (($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice);

        // Lấy danh sách các giá trị ENUM của check_in
        $checkInOptions = $this->getEnumValues('bookings', 'check_in');

        $formattedBooking = [
            'id' => $booking->id,
            'customer_name' => $booking->user->name ?? 'N/A',
            'phone' => $booking->user->phone ?? 'N/A',
            'email' => $booking->user->email ?? 'N/A',
            'showtime' => $booking->showtime
                ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                : 'N/A',
            'show_date' => $show_date, // Đã đảm bảo $show_date luôn có giá trị
            'movie_title' => $movie ? $movie['title'] : 'N/A',
            'room_name' => $room_name ?? 'N/A',
            'room_type' => $room_type ?? 'N/A',
            'seats' => $seats,
            'combos' => $combos,
            'total_ticket_price' => (int) $booking->total_ticket_price,
            'total_combo_price' => (int) $booking->total_combo_price,
            'total_price' => $totalPrice,
            'discount' => $discount,
            'status' => $booking->status,
            'check_in' => $booking->check_in,
            'check_in_options' => $checkInOptions,
            'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
        ];

        return response()->json([
            'message' => 'Chi tiết đơn hàng',
            'data' => $formattedBooking,
        ]);
    }

    /**
     * Lấy tất cả giá trị ENUM của một cột trong bảng
     */
    private function getEnumValues($table, $column)
    {
        $result = DB::select("SHOW COLUMNS FROM {$table} WHERE Field = ?", [$column]);

        if (empty($result)) {
            return [];
        }

        // Lấy định nghĩa của cột (ví dụ: "enum('absent','checked_in','waiting')")
        $type = $result[0]->Type;

        // Trích xuất các giá trị từ chuỗi enum
        preg_match("/^enum\((.*)\)$/", $type, $matches);
        if (empty($matches[1])) {
            return [];
        }

        // Chuyển chuỗi giá trị thành mảng (bỏ dấu nháy đơn)
        $values = array_map(function ($value) {
            return trim($value, "'");
        }, explode(',', $matches[1]));

        return $values;
    }

    public function updateStatusClient(Request $request, string $id)
    {
        //Tìm đơn theo id
        $booking = Booking::find($id);

        // Validate dữ liệu đầu vào
        $validated = $request->validate([
            'check_in' => 'required|in:absent,checked_in,waiting', // Đảm bảo giá trị nằm trong các giá trị ENUM
        ]);

        // Cập nhật chỉ trường check_in
        $booking->update([
            'check_in' => $validated['check_in'],
        ]);

        // Trả về JSON response
        return response()->json([
            'message' => 'Check-in thành công',
            'data' => $booking,
        ], 200);
    }

    // Tìm kiếm giao dịch
    public function searchOrders(Request $request)
    {
        // Lấy user_id từ auth()
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }

        // Lấy các tham số tìm kiếm từ request
        $movieTitle = $request->input('title'); // Tên phim
        $status = $request->input('status'); // Trạng thái (pending, completed, cancelled)
        $date = $request->input('date'); // Ngày giao dịch (dạng Y-m-d, ví dụ: 2025-03-25)

        $query = Booking::query()
            ->where('user_id', $userId) // Chỉ lấy giao dịch của khách hàng hiện tại
            ->with([
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'status',
                'created_at'
            );

        // Tìm kiếm theo tên phim
        if ($movieTitle) {
            $query->whereHas('showtime.calendarShow.movie', function ($q) use ($movieTitle) {
                $q->where('title', 'like', '%' . $movieTitle . '%');
            });
        }

        // Tìm kiếm theo trạng thái
        if ($status) {
            $query->where('status', $status);
        }

        // Tìm kiếm theo ngày giao dịch
        if ($date) {
            $startOfDay = Carbon::parse($date)->startOfDay();
            $endOfDay = Carbon::parse($date)->endOfDay();
            $query->whereBetween('created_at', [$startOfDay, $endOfDay]);
        }

        $bookings = $query->latest('id')
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                if ($booking->showtime && $booking->showtime->showTimeDate) {
                    $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                        ? $booking->showtime->showTimeDate->first()
                        : $booking->showtime->showTimeDate;

                    if ($showTimeDate && $showTimeDate->show_date) {
                        // Chuyển show_date thành đối tượng Carbon và định dạng
                        try {
                            $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                        } catch (\Exception $e) {
                            // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                            $show_date = $showTimeDate->show_date ?: 'N/A';
                        }
                    }
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => $detail->quantity,
                                'price' => $detail->price,
                            ];
                        }
                    }
                }

                return [
                    'id' => $booking->id,
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    'show_date' => $show_date,
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'movie_poster' => $movie ? $movie['poster'] : null,
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => (int) $booking->total_ticket_price,
                    'total_combo_price' => (int) $booking->total_combo_price,
                    'total_price' => (int) ($booking->total_ticket_price + $booking->total_combo_price),
                    'status' => $booking->status,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y H:i:s') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Kết quả tìm kiếm giao dịch',
            'data' => $bookings,
        ]);
    }

    // Lấy danh sách giao dịch gần đây (20 giao dịch gần nhất)
    public function recentOrders(Request $request)
    {
        // Lấy user_id từ auth()
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }

        $bookings = Booking::query()
            ->where('user_id', $userId) // Chỉ lấy giao dịch của khách hàng hiện tại
            ->latest('id')
            ->take(20) // Lấy 20 giao dịch gần nhất
            ->with([
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'status',
                'created_at'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                // if ($booking->showtime && $booking->showtime->showTimeDate) {
                //     $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                //         ? $booking->showtime->showTimeDate->first()
                //         : $booking->showtime->showTimeDate;

                //     if ($showTimeDate && $showTimeDate->show_date) {
                //         // Chuyển show_date thành đối tượng Carbon và định dạng
                //         try {
                //             $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                //         } catch (\Exception $e) {
                //             // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                //             $show_date = $showTimeDate->show_date ?: 'N/A';
                //         }
                //     }
                // }   

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => (int) $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => (int) $detail->quantity,
                                'price' => (int) $detail->price,
                            ];
                        }
                    }
                }

                return [
                    'id' => $booking->id,
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    // 'show_date' => $show_date,
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'movie_poster' => $movie ? $movie['poster'] : null,
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => (int) $booking->total_ticket_price,
                    'total_combo_price' => (int) $booking->total_combo_price,
                    'total_price' => (int) ($booking->total_ticket_price + $booking->total_combo_price),
                    'status' => $booking->status,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y H:i:s') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Danh sách giao dịch gần đây',
            'data' => $bookings,
        ]);
    }

    // Lấy danh sách tất cả giao dịch đã hoàn tất
    public function confirmedOrders(Request $request)
    {
        // Lấy user_id từ auth()
        $userId = Auth::id();

        if (!$userId) {
            return response()->json([
                'message' => 'Người dùng chưa đăng nhập',
            ], 401);
        }

        $bookings = Booking::query()
            ->where('user_id', $userId) // Chỉ lấy giao dịch của khách hàng hiện tại
            ->where('status', 'confirmed') // Chỉ lấy giao dịch đã hoàn tất
            ->latest('id')
            ->with([
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster');
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name');
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'status',
                'created_at'
            )
            ->get()
            ->map(function ($booking) {
                // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
                $seats = [];
                $room_name = null;
                $room_type = null;
                $combos = [];
                $movie = null;

                // Lấy thông tin phim từ showtime -> calendarShow -> movie
                if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
                    $movie = [
                        'id' => $booking->showtime->calendarShow->movie->id,
                        'title' => $booking->showtime->calendarShow->movie->title,
                        'poster' => $booking->showtime->calendarShow->movie->poster,
                    ];
                }

                // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
                if ($booking->showtime && $booking->showtime->showTimeDate) {
                    $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                        ? $booking->showtime->showTimeDate->first()
                        : $booking->showtime->showTimeDate;

                    if ($showTimeDate && $showTimeDate->show_date) {
                        // Chuyển show_date thành đối tượng Carbon và định dạng
                        try {
                            $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                        } catch (\Exception $e) {
                            // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                            $show_date = $showTimeDate->show_date ?: 'N/A';
                        }
                    }
                }

                if ($booking->bookingDetails) {
                    foreach ($booking->bookingDetails as $detail) {
                        // Thêm ghế nếu có
                        if ($detail->seat) {
                            $seatName = "{$detail->seat->row}{$detail->seat->column}";
                            $seats[] = [
                                'booking_detail_id' => $detail->id,
                                'seat_name' => $seatName,
                                'price' => (int) $detail->price,
                            ];

                            // Lấy tên phòng và loại phòng
                            if ($detail->seat->room) {
                                $room_name = $detail->seat->room->name;
                                $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                            }
                        }

                        // Thêm combo nếu có
                        if ($detail->combo) {
                            $combos[] = [
                                'booking_detail_id' => $detail->id,
                                'combo_name' => $detail->combo->name,
                                'quantity' => (int) $detail->quantity,
                                'price' => (int) $detail->price,
                            ];
                        }
                    }
                }

                return [
                    'id' => $booking->id,
                    'showtime' => $booking->showtime
                        ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                        : 'N/A',
                    'show_date' => $show_date,
                    'movie_title' => $movie ? $movie['title'] : 'N/A',
                    'movie_poster' => $movie ? $movie['poster'] : null,
                    'room_name' => $room_name ?? 'N/A',
                    'room_type' => $room_type ?? 'N/A',
                    'seats' => $seats,
                    'combos' => $combos,
                    'total_ticket_price' => (int) $booking->total_ticket_price,
                    'total_combo_price' => (int) $booking->total_combo_price,
                    'total_price' => (int) ($booking->total_ticket_price + $booking->total_combo_price),
                    'status' => $booking->status,
                    'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y H:i:s') : 'N/A',
                ];
            });

        return response()->json([
            'message' => 'Danh sách giao dịch đã hoàn tất',
            'data' => $bookings,
        ]);
    }

    public function showForClient($bookingId)
    {
        $booking = Booking::query()
            ->with([
                'user' => function ($query) {
                    $query->select('id', 'name', 'email', 'phone');
                },
                'showtime' => function ($query) {
                    $query->select('id', 'calendar_show_id', 'start_time', 'end_time')
                        ->with([
                            'calendarShow' => function ($query) {
                                $query->select('id', 'movie_id')
                                    ->with([
                                        'movie' => function ($query) {
                                            $query->select('id', 'title', 'poster'); // Lấy thông tin phim
                                        }
                                    ]);
                            },
                            'showTimeDate' => function ($query) {
                                $query->select('id', 'show_time_id', 'show_date');
                            }
                        ]);
                },
                'bookingDetails' => function ($query) {
                    $query->with([
                        'seat' => function ($query) {
                            $query->select('id', 'room_id', 'row', 'column')
                                ->with([
                                    'room' => function ($query) {
                                        $query->select('id', 'name', 'room_type_id')
                                            ->with([
                                                'roomType' => function ($query) {
                                                    $query->select('id', 'name'); // Lấy tên loại phòng từ room_types
                                                }
                                            ]);
                                    }
                                ]);
                        },
                        'combo' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])
            ->select(
                'id',
                'user_id',
                'showtime_id',
                'total_ticket_price',
                'total_combo_price',
                'total_price',
                'status',
                'check_in', // Đã thêm từ yêu cầu trước
                'created_at'
            )
            ->find($bookingId);

        if (!$booking) {
            return response()->json([
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Khởi tạo danh sách ghế, phòng, loại phòng, combo và thông tin phim
        $seats = [];
        $room_name = null;
        $room_type = null;
        $combos = [];
        $movie = null;

        // Lấy thông tin phim từ showtime -> calendarShow -> movie
        if ($booking->showtime && $booking->showtime->calendarShow && $booking->showtime->calendarShow->movie) {
            $movie = [
                'id' => $booking->showtime->calendarShow->movie->id,
                'title' => $booking->showtime->calendarShow->movie->title,
                'poster' => $booking->showtime->calendarShow->movie->poster,
            ];
        }

        // Lấy show_date từ showTimeDate (xử lý trường hợp collection hoặc null)
        if ($booking->showtime && $booking->showtime->showTimeDate) {
            $showTimeDate = $booking->showtime->showTimeDate instanceof Collection
                ? $booking->showtime->showTimeDate->first()
                : $booking->showtime->showTimeDate;

            if ($showTimeDate && $showTimeDate->show_date) {
                // Chuyển show_date thành đối tượng Carbon và định dạng
                try {
                    $show_date = Carbon::parse($showTimeDate->show_date)->format('d-m-Y');
                } catch (\Exception $e) {
                    // Nếu parse thất bại, giữ nguyên giá trị hoặc trả về 'N/A'
                    $show_date = $showTimeDate->show_date ?: 'N/A';
                }
            }
        }

        if ($booking->bookingDetails) {
            foreach ($booking->bookingDetails as $detail) {
                if ($detail->seat) {
                    $seatName = "{$detail->seat->row}{$detail->seat->column}";
                    // Xác định loại ghế (seat_type) dựa trên room_type
                    $seatType = 'Thường'; // Mặc định là Thường
                    if ($detail->seat->room && $detail->seat->room->roomType) {
                        $roomTypeName = $detail->seat->room->roomType->name;
                        if (stripos($roomTypeName, 'VIP') !== false) {
                            $seatType = 'VIP';
                        } elseif (stripos($roomTypeName, 'Sweetbox') !== false) {
                            $seatType = 'Sweetbox';
                        }
                    }

                    $seats[] = [
                        'booking_detail_id' => $detail->id,
                        'seat_name' => $seatName,
                        'price' => (int) $detail->price,
                        'seat_type' => $seatType,
                    ];

                    // Lấy tên phòng và loại phòng
                    if ($detail->seat->room) {
                        $room_name = $detail->seat->room->name;
                        $room_type = $detail->seat->room->roomType ? $detail->seat->room->roomType->name : null;
                    }
                }

                if ($detail->combo) {
                    $combos[] = [
                        'booking_detail_id' => $detail->id,
                        'combo_name' => $detail->combo->name,
                        'quantity' => (int) $detail->quantity,
                        'price' => (int) $detail->price,
                    ];
                }
            }
        }

        // Tính tổng tiền và giảm giá
        $totalPrice = $booking->total_price;
        if ($totalPrice == 0) {
            $totalPrice = $booking->total_ticket_price + $booking->total_combo_price;
        }
        $discount = ($booking->total_ticket_price + $booking->total_combo_price) - $totalPrice;

        // Lấy danh sách các giá trị ENUM của check_in
        $checkInOptions = $this->getEnumValues('bookings', 'check_in');

        $formattedBooking = [
            'id' => $booking->id,
            'customer_name' => $booking->user->name ?? 'N/A',
            'phone' => $booking->user->phone ?? 'N/A',
            'email' => $booking->user->email ?? 'N/A',
            'showtime' => $booking->showtime
                ? Carbon::parse($booking->showtime->start_time)->format('H:i') . ' - ' . Carbon::parse($booking->showtime->end_time)->format('H:i')
                : 'N/A',
            'show_date' => $show_date,
            'movie_title' => $movie ? $movie['title'] : 'N/A',
            'room_name' => $room_name ?? 'N/A',
            'room_type' => $room_type ?? 'N/A',
            'seats' => $seats,
            'combos' => $combos,
            'total_ticket_price' => (int) $booking->total_ticket_price,
            'total_combo_price' => (int) $booking->total_combo_price,
            'total_price' => (int) $totalPrice,
            'discount' => (int) $discount,
            'status' => $booking->status,
            'check_in' => $booking->check_in,
            'check_in_options' => $checkInOptions,
            'created_at' => $booking->created_at ? $booking->created_at->format('d-m-Y') : 'N/A',
        ];

        return response()->json([
            'message' => 'Chi tiết giao dịch',
            'data' => $formattedBooking,
        ]);
    }
}
