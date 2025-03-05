// src/services/room.service.tsx
import axios from 'axios';
import { 
    Room, 
    RoomCreateRequest, 
    RoomCreateResponse, 
    RoomUpdateRequest, 
    RoomUpdateResponse, 
    RoomListResponse, 
    RoomDeleteRequest, 
    RoomDeleteResponse, 
    RoomRestoreResponse, 
    ApiError 
} from '../types/room.types';

// Base URL for API (adjust according to your Laravel setup)
const BASE_URL = "http://localhost:8000/api";

// API endpoints matching Laravel routes
const ENDPOINTS = {
    GET_ROOMS: `${BASE_URL}/room`, // GET: List rooms
    CREATE_ROOM: `${BASE_URL}/room`, // POST: Create room
    GET_ROOM: (id: string | number) => `${BASE_URL}/room/${id}`, // GET: Show room
    UPDATE_ROOM: (id: string | number) => `${BASE_URL}/room/${id}`, // PUT: Update room
    DELETE_ROOMS: `${BASE_URL}/room`, // DELETE: Soft delete rooms
    RESTORE_ROOM: (id: string | number) => `${BASE_URL}/room/restore/${id}`, // POST: Restore room
};

// Utility to normalize and validate IDs
const normalizeId = (id: string | number): string => {
    const normalized = String(id).trim();
    if (!normalized) {
        throw new Error('Room ID cannot be empty');
    }
    return normalized;
};

// Get list of rooms
export const getRooms = async (): Promise<RoomListResponse> => {
    try {
        const response = await axios.get<RoomListResponse>(ENDPOINTS.GET_ROOMS);
        return {
            ...response.data,
            rooms: response.data.rooms.map(room => ({
                ...room,
                id: normalizeId(room.id),
            })),
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Get single room details
export const getRoom = async (id: string | number): Promise<Room> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.get<Room>(ENDPOINTS.GET_ROOM(roomId));
        return {
            ...response.data,
            id: normalizeId(response.data.id),
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Create a new room
export const createRoom = async (data: RoomCreateRequest): Promise<RoomCreateResponse> => {
    try {
        const response = await axios.post<RoomCreateResponse>(
            ENDPOINTS.CREATE_ROOM,
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return {
            ...response.data,
            room: {
                ...response.data.room,
                id: normalizeId(response.data.room.id),
            },
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Update an existing room
export const updateRoom = async (
    id: string | number,
    data: RoomUpdateRequest
): Promise<RoomUpdateResponse> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.put<RoomUpdateResponse>(
            ENDPOINTS.UPDATE_ROOM(roomId),
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return {
            ...response.data,
            room: {
                ...response.data.room,
                id: normalizeId(response.data.room.id),
            },
        };
    } catch (error) {
        throw handleApiError(error);
    }
};

// Soft delete multiple rooms
export const deleteRooms = async (data: RoomDeleteRequest): Promise<RoomDeleteResponse> => {
    if (!data.ids?.length) {
        throw new Error('No rooms selected for deletion');
    }
    const normalizedIds = data.ids.map(normalizeId);
    try {
        const response = await axios.delete<RoomDeleteResponse>(
            ENDPOINTS.DELETE_ROOMS,
            {
                data: { ids: normalizedIds },
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Restore a soft-deleted room
export const restoreRoom = async (id: string | number): Promise<RoomRestoreResponse> => {
    const roomId = normalizeId(id);
    try {
        const response = await axios.post<RoomRestoreResponse>(
            ENDPOINTS.RESTORE_ROOM(roomId)
        );
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Handle API errors
const handleApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error) && error.response) {
        const { data, status } = error.response;
        return {
            error: data.error || 'An error occurred',
            message: data.message,
            details: data.details || data.errors,
            status,
        };
    }
    return {
        error: 'Unexpected error occurred',
        message: String(error),
    };
};

export default {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRooms,
    restoreRoom,
};