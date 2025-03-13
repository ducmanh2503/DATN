import axios from 'axios';
import { 
    SeatCreateRequest, 
    SeatUpdateRequest, 
    SeatUpdateResponse, 
    SeatingMatrix, 
    ApiError, 
    Seat
} from '../types/seat.types';

// Define BASE_URL consistent with the API routes
const BASE_URL = "http://localhost:8000/api";

// Define endpoints based on the provided API controller
const ENDPOINTS = {
    GET_SEATS_BY_ROOM: (roomId: number) => `${BASE_URL}/seats/room/${roomId}`,
    GET_SEATS_FOR_BOOKING: (roomId: number) => `${BASE_URL}/seats/booking/${roomId}`,
    UPDATE_SEAT_STATUS: `${BASE_URL}/seats/update-status`,
    HOLD_SEAT: `${BASE_URL}/seats/hold`,
    RELEASE_SEAT: `${BASE_URL}/seats/release`,
    HOLD_SELECTED_SEATS: `${BASE_URL}/seats/hold-selected`,
    CREATE_SEAT: `${BASE_URL}/seats`,
    UPDATE_SEAT: (seatId: number) => `${BASE_URL}/seats/${seatId}`,
    DELETE_SEAT: (seatId: number) => `${BASE_URL}/seats/${seatId}`,
    DELETE_ALL_SEATS_IN_ROOM: (roomId: number) => `${BASE_URL}/seats/room/${roomId}/delete-all`,
};

// Get seats by room ID for admin view
export const getSeats = async (roomId: number): Promise<SeatingMatrix> => {
    try {
        const response = await axios.get<SeatingMatrix>(ENDPOINTS.GET_SEATS_BY_ROOM(roomId));
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Get seats for booking (includes real-time seat holding information)
export const getSeatsForBooking = async (roomId: number): Promise<SeatingMatrix> => {
    try {
        const response = await axios.get<SeatingMatrix>(ENDPOINTS.GET_SEATS_FOR_BOOKING(roomId));
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Hold a single seat for booking
export const holdSeat = async (seatId: number): Promise<{message: string, seat: number, expires_at: string}> => {
    try {
        const response = await axios.post(ENDPOINTS.HOLD_SEAT, { seat: seatId });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Hold multiple seats for booking
export const holdSelectedSeats = async (seatIds: number[]): Promise<{message: string, held_seats: any}> => {
    try {
        const response = await axios.post(ENDPOINTS.HOLD_SELECTED_SEATS, { seats: seatIds });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Release a held seat
export const releaseSeat = async (seatId: number): Promise<{message: string, seat: number}> => {
    try {
        const response = await axios.post(ENDPOINTS.RELEASE_SEAT, { seat: seatId });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Update seat status
export const updateSeatStatus = async (seats: {seat_id: number, seat_status: string}[]): Promise<SeatUpdateResponse> => {
    try {
        const response = await axios.post<SeatUpdateResponse>(ENDPOINTS.UPDATE_SEAT_STATUS, { seats });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Create a new seat
export const createSeat = async (seatData: SeatCreateRequest): Promise<{message: string, data: Seat}> => {
    try {
        const response = await axios.post(ENDPOINTS.CREATE_SEAT, seatData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Update an existing seat
export const updateSeat = async (seatId: number, seatData: SeatUpdateRequest): Promise<{message: string, data: Seat}> => {
    try {
        const response = await axios.put(ENDPOINTS.UPDATE_SEAT(seatId), seatData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Delete a seat
export const deleteSeat = async (seatId: number): Promise<{message: string}> => {
    try {
        const response = await axios.delete(ENDPOINTS.DELETE_SEAT(seatId));
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Delete all seats in a room
export const deleteAllSeatsInRoom = async (roomId: number): Promise<{message: string}> => {
    try {
        const response = await axios.delete(ENDPOINTS.DELETE_ALL_SEATS_IN_ROOM(roomId));
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Common API error handling function
const handleApiError = (error: any): ApiError => {
    if (axios.isAxiosError(error) && error.response) {
        const { data, status } = error.response;
        return {
            error: data.error || data.message || 'Có lỗi xảy ra!',
            message: data.message,
            details: data.details || data.errors,
            status,
        };
    }
    return {
        error: 'Lỗi không xác định!',
    };
};

// Export all service functions
export default {
    getSeats,
    getSeatsForBooking,
    holdSeat,
    holdSelectedSeats,
    releaseSeat,
    updateSeatStatus,
    createSeat,
    updateSeat,
    deleteSeat,
    deleteAllSeatsInRoom,
};