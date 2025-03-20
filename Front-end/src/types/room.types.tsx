// src/types/room.types.ts

// Giao diện cho mô hình Room, khớp với Room model trong backend
export interface Room {
<<<<<<< HEAD
    id: string | number;
    name: string;
    capacity: number;
    room_type_id: number;
    room_type?: string; // Tên loại phòng (có thể được thêm vào từ frontend)
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null; // Hỗ trợ soft delete từ backend
=======
  id: string | number;
  name: string;
  capacity: number;
  room_type_id: number;
  room_type?: string; // Tên loại phòng (có thể được thêm vào từ frontend)
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; // Hỗ trợ soft delete từ backend
>>>>>>> main
}

// Giao diện cho loại phòng
export interface RoomType {
<<<<<<< HEAD
    id: number;
    name: string;
=======
  id: number;
  name: string;
>>>>>>> main
}

// Giao diện cho loại ghế
export interface SeatType {
<<<<<<< HEAD
    id: number;
    name: string;
    price: number;
=======
  id: number;
  name: string;
  price: number;
>>>>>>> main
}

// Yêu cầu tạo phòng mới
export interface RoomCreateRequest {
<<<<<<< HEAD
    name: string;
    capacity: number;
    room_type_id: number;
=======
  name: string;
  room_type_id: number;
>>>>>>> main
}

// Phản hồi khi tạo phòng
export interface RoomCreateResponse {
    message: string;
    room: Room;
}

// Yêu cầu cập nhật phòng
export interface RoomUpdateRequest {
<<<<<<< HEAD
    name?: string;
    capacity?: number;
    room_type_id?: number;
=======
  name?: string;
  room_type_id?: number;
>>>>>>> main
}

// Phản hồi khi cập nhật phòng
export interface RoomUpdateResponse {
    message: string;
    room: Room;
}

// Phản hồi danh sách phòng
export interface RoomListResponse {
    message?: string;
    rooms: Room[];
}

// Yêu cầu xóa nhiều phòng
export interface RoomDeleteRequest {
    ids: (string | number)[];
}

// Phản hồi khi xóa phòng
export interface RoomDeleteResponse {
    message: string;
    deletedCount?: number;
    deletedIds?: (string | number)[];
}

// Phản hồi khi khôi phục phòng
export interface RoomRestoreResponse {
    message: string;
    room?: Room;
}

// Định dạng lỗi API từ backend
export interface ApiError {
<<<<<<< HEAD
    error: string;
    message?: string;
    details?: Record<string, string[]>; // Chi tiết lỗi validation từ backend
    status?: number;
=======
  error: string;
  message?: string;
  details?: Record<string, string[]>; // Chi tiết lỗi validation từ backend
  status?: number;
>>>>>>> main
}