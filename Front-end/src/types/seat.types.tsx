// src/types/seat.types.ts

// Định nghĩa type cho SeatType (Loại ghế)
export interface SeatType {
    id: number;
    name: string; // Tên loại ghế (Thường, VIP, Sweetbox, ...)
    price: number; // Giá của loại ghế
}

// Định nghĩa type cho Seat (Ghế ngồi) từ database/model
export interface Seat {
    id: number;
    room_id: number;
    row: string;
    column: string;
    seat_type_id: number;
    seat_status: 'available' | 'booked';
    seatType?: SeatType;
    price?: number;
    created_at?: string;
    updated_at?: string;
}

// Định nghĩa type cho dữ liệu ghế trong ma trận (dùng trong getSeats API)
export interface SeatMatrixItem {
    id: number;
    seatCode: string; // Mã ghế (VD: A1, B2, ...)
    type: string; // Tên loại ghế (Thường, VIP, Sweetbox, ...)
    status: 'available' | 'booked'; // Trạng thái ghế
    price: number; // Giá ghế
}

// Định nghĩa type cho ma trận ghế (response từ getSeats)
export interface SeatingMatrix {
    [row: string]: {
        [column: string]: SeatMatrixItem;
    };
}

// Định nghĩa type cho dữ liệu gửi lên khi cập nhật trạng thái ghế (updateSeatStatus API)
export interface SeatUpdateRequest {
    seat_id: number;
    seat_status: 'available' | 'booked';
}

// Định nghĩa type cho response từ updateSeatStatus API
export interface SeatUpdateResponse {
    message: string;
    updated_seats: {
        seat_id: number;
        seat_status: 'available' | 'booked';
    }[];
}

// Định nghĩa type cho dữ liệu gửi lên khi tạo ghế mới (store API)
export interface SeatCreateRequest {
    room_id: number;
    row: string;
    column: string;
    seat_type_id: number;
    seat_status: 'available' | 'booked';
}

// Định nghĩa type cho response từ store API
export interface SeatCreateResponse {
    message: string;
    data: Seat[];
}

// Định nghĩa type cho dữ liệu gửi lên khi xóa một ghế (deleteSeat API)
export type DeleteSeatResponse = void; // Không cần type phức tạp vì DELETE thường không trả về dữ liệu

// Định nghĩa type cho dữ liệu gửi lên khi xóa tất cả ghế trong phòng (deleteAllSeatsInRoom API)
export type DeleteAllSeatsResponse = void; // Không cần type phức tạp vì DELETE thường không trả về dữ liệu

// Định nghĩa type cho props của component hiển thị ghế
export interface SeatDisplayProps {
    roomId: number; // ID của phòng chiếu
    seats: SeatingMatrix; // Ma trận ghế
    onSeatSelect?: (seat: SeatMatrixItem) => void; // Callback khi chọn ghế
}

// Định nghĩa type cho props của form tạo ghế
export interface SeatFormProps {
    onSubmit: (data: SeatCreateRequest[]) => void; // Callback khi submit form
    roomId?: number; // ID của phòng chiếu (nếu có)
    seatTypes: SeatType[]; // Danh sách loại ghế để chọn
}

// Định nghĩa type cho dữ liệu của bảng chính trong SeatPage (dùng cho Table hiển thị hàng)
export interface TableDataSource {
    key: string; // Key duy nhất cho mỗi hàng
    row: string; // Tên hàng (VD: A, B, C)
}

// Định nghĩa type cho lỗi từ API
export interface ApiError {
    error?: string;
    message?: string;
    [key: string]: any;
}