// SeatType model
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

// Response format for a list of seats in a room (matrix format)
export interface SeatingMatrix {
    [row: string]: {
        [column: string]: SeatInMatrix;
    };
}

// Individual seat representation within the matrix
export interface SeatInMatrix {
    id: number;
    seatCode: string;
    type: string;
    status: 'available' | 'booked';
    price: number;
    isHeld?: boolean;
    heldByUser?: boolean;
}

// General seat model
export interface Seat {
<<<<<<< HEAD
    id: number;
    room_id: number;
    row: string;
    column: string;
    seat_type_id: number;
    seat_status: 'available' | 'booked'; 
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    seatType?: SeatType;
=======
  id: number;
  room_id: number;
  row: string;
  column: string;
  seat_type_id: number;
  seat_status: "available" | "booked";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  seatType?: SeatType;
>>>>>>> main
}

// Request for creating a new seat
export interface SeatCreateRequest {
<<<<<<< HEAD
    room_id: number;
    row: string;
    column: string;
    seat_type_id: number;
    seat_status?: 'available' | 'booked'; // Optional để tương thích với cả 2 loại API
=======
  room_id: number;
  row: string;
  column: string;
  seat_type_id: number;
  seat_status?: "available" | "booked"; // Optional để tương thích với cả 2 loại API
>>>>>>> main
}

// Request for updating an existing seat
export interface SeatUpdateRequest {
<<<<<<< HEAD
    row?: string;
    column?: string;
    seat_type_id?: number;
    seat_status?: 'available' | 'booked';
=======
  row?: string;
  column?: string;
  seat_type_id?: number;
  seat_status?: "available" | "booked";
>>>>>>> main
}

// Response for seat status update
export interface SeatUpdateResponse {
<<<<<<< HEAD
    message: string;
    updated_seats: Array<{
        seat_id: number;
        seat_status?: string;
    }>;
=======
  message: string;
  updated_seats: Array<{
    seat_id: number;
    seat_status?: string;
  }>;
>>>>>>> main
}

// API Error response format
export interface ApiError {
    error: string;
    message?: string;
    details?: Record<string, string[]>;
    status?: number;
}