// src/types/room.types.ts

// Room model from database
export interface Room {
    id: string | number; // Room ID can be string or number based on Laravel
    name: string; // Room name
    capacity: number; // Room capacity
    room_type: '2D' | '3D' | '4D'; // Room type enum
    created_at?: string; // Creation timestamp
    updated_at?: string; // Update timestamp
    deleted_at?: string | null; // Soft delete timestamp
}

// Request for creating a new room (store API)
export interface RoomCreateRequest {
    name: string;
    capacity: number;
    room_type: '2D' | '3D' | '4D';
}

// Response from store API
export interface RoomCreateResponse {
    message: string;
    room: Room;
}

// Request for updating a room (update API)
export interface RoomUpdateRequest {
    name: string;
    capacity: number;
    room_type: '2D' | '3D' | '4D';
}

// Response from update API
export interface RoomUpdateResponse {
    message: string;
    room: Room;
}

// Response from index API (list of rooms)
export interface RoomListResponse {
    message: string;
    rooms: Room[];
}

// Request for deleting multiple rooms (destroy API)
export interface RoomDeleteRequest {
    ids: (string | number)[];
}

// Response from destroy API
export interface RoomDeleteResponse {
    message: string;
}

// Response from restore API
export interface RoomRestoreResponse {
    message: string;
}

// Props for room display component
export interface RoomDisplayProps {
    rooms: Room[];
    onRoomSelect?: (room: Room) => void; // Optional callback for room selection
}

// Props for room form component (create/update)
export interface RoomFormProps {
    onSubmit: (data: RoomCreateRequest | RoomUpdateRequest) => void;
    initialData?: Room; // Optional initial data for edit mode
}

// Data structure for room table display
export interface RoomTableDataSource {
    key: string | number;
    name: string;
    capacity: number;
    room_type: '2D' | '3D' | '4D';
}

// API error response structure
export interface ApiError {
    error?: string;
    message?: string;
    details?: string | Record<string, any>;
    status?: number;
    [key: string]: any;
}