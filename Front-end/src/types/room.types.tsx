// src/types/room.types.ts

// Room model interface
export interface Room {
  id: string;
  name: string;
  capacity: number;
  room_type: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Request for creating a new room
export interface RoomCreateRequest {
  name: string;
  capacity: number;
  room_type: string;
}

// Response for room creation
export interface RoomCreateResponse {
  message: string;
  room: Room;
}

// Request for updating a room
export interface RoomUpdateRequest {
  name?: string;
  capacity?: number;
  room_type?: string;
}

// Response for room update
export interface RoomUpdateResponse {
  message: string;
  room: Room;
}

// Response for room listing
export interface RoomListResponse {
  message?: string;
  rooms: Room[];
}

// Request for deleting rooms
export interface RoomDeleteRequest {
  ids: (string | number)[];
}

// Response for room deletion
export interface RoomDeleteResponse {
  message: string;
  deletedCount?: number;
  deletedIds?: (string | number)[];
}

// Response for restoring a room
export interface RoomRestoreResponse {
  message: string;
  room?: Room;
}

// API Error response format
export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
  status?: number;
}
