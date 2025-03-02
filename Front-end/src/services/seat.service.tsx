// src/services/seat.service.tsx
import axios from 'axios';
import { 
    SeatCreateRequest, 
    SeatCreateResponse, 
    SeatUpdateRequest, 
    SeatUpdateResponse, 
    SeatingMatrix, 
    ApiError 
} from '../types/seat.types';

// Định nghĩa BASE_URL dựa trên config bạn cung cấp
const BASE_URL = "http://localhost:8000/api";

// Định nghĩa các endpoint cho Seat dựa trên route API của bạn
const GET_SEATS_BY_ROOM = (roomId: number) => `${BASE_URL}/seats/room/${roomId}`;
const UPDATE_SEAT_STATUS = `${BASE_URL}/seats/update-status`;
const CREATE_SEATS = `${BASE_URL}/seats`;
const DELETE_SEAT = (seatId: number) => `${BASE_URL}/seats/${seatId}`; // Xóa một ghế
const DELETE_ALL_SEATS_IN_ROOM = (roomId: number) => `${BASE_URL}/seats/room/${roomId}/delete-all`; // Xóa tất cả ghế trong phòng

// Lấy danh sách ghế theo roomId
export const getSeatsByRoom = async (roomId: number): Promise<SeatingMatrix> => {
    try {
        const response = await axios.get<SeatingMatrix>(GET_SEATS_BY_ROOM(roomId));
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Cập nhật trạng thái ghế
export const updateSeatStatus = async (seats: SeatUpdateRequest[]): Promise<SeatUpdateResponse> => {
    try {
        const response = await axios.post<SeatUpdateResponse>(UPDATE_SEAT_STATUS, { seats });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Tạo mới ghế
export const createSeats = async (seats: SeatCreateRequest[]): Promise<SeatCreateResponse> => {
    try {
        const response = await axios.post<SeatCreateResponse>(CREATE_SEATS, seats);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Xóa một ghế
export const deleteSeat = async (seatId: number): Promise<void> => {
    try {
        await axios.delete(DELETE_SEAT(seatId));
    } catch (error) {
        throw handleApiError(error);
    }
};

// Xóa tất cả ghế trong phòng
export const deleteAllSeatsInRoom = async (roomId: number): Promise<void> => {
    try {
        await axios.delete(DELETE_ALL_SEATS_IN_ROOM(roomId));
    } catch (error) {
        throw handleApiError(error);
    }
};

// Hàm lấy danh sách loại ghế (SeatType)
const GET_SEAT_TYPES = `${BASE_URL}/seat-types`;

export const getSeatTypes = async (): Promise<{ id: number; name: string; price: number }[]> => {
    try {
        const response = await axios.get<{ id: number; name: string; price: number }[]>(GET_SEAT_TYPES);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Hàm xử lý lỗi API chung
const handleApiError = (error: any): ApiError => {
    if (axios.isAxiosError(error) && error.response) {
        const { data, status } = error.response;
        return {
            error: data.error || data.message || 'Có lỗi xảy ra!',
            status,
        };
    }
    return {
        error: 'Lỗi không xác định!',
    };
};

// Export các hàm dịch vụ
export default {
    getSeatsByRoom,
    updateSeatStatus,
    createSeats,
    deleteSeat,
    deleteAllSeatsInRoom, // Thêm hàm xóa tất cả ghế trong phòng vào export
    getSeatTypes,
};