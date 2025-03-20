import axios from "axios";
import {
  SeatCreateRequest,
  SeatUpdateRequest,
  SeatUpdateResponse,
  SeatingMatrix,
  ApiError,
  Seat,
  SeatType,
} from "../types/seat.types";

// Define BASE_URL consistent with the API routes
const BASE_URL = "http://localhost:8000/api";

// Define endpoints based on the available API routes from backend
const ENDPOINTS = {
  GET_SEATS_BY_ROOM: (roomId: number) => `${BASE_URL}/seats/room/${roomId}`,
  UPDATE_SEAT_STATUS: `${BASE_URL}/seats/update-status`,
  HOLD_SEAT: `${BASE_URL}/seats/hold`,
  RELEASE_SEAT: `${BASE_URL}/seats/release`,
  HOLD_SELECTED_SEATS: `${BASE_URL}/seats/hold-selected`,
  CREATE_SEAT: `${BASE_URL}/seats`,
  UPDATE_SEAT: (seatId: number) => `${BASE_URL}/seats/${seatId}`,
  DELETE_SEAT: (seatId: number) => `${BASE_URL}/seats/${seatId}`,
  DELETE_ALL_SEATS_IN_ROOM: (roomId: number) =>
    `${BASE_URL}/seats/deleteAll/${roomId}`,
};

// Default seat types for fallback
const DEFAULT_SEAT_TYPES: SeatType[] = [
  { id: 1, name: "Thường", price: 50000 },
  { id: 2, name: "VIP", price: 100000 },
  { id: 3, name: "Sweetbox", price: 150000 },
];

// Get seats by room ID for admin view
export const getSeats = async (roomId: number): Promise<SeatingMatrix> => {
  try {
    const response = await axios.get<SeatingMatrix>(
      ENDPOINTS.GET_SEATS_BY_ROOM(roomId)
    );

    // Đảm bảo dữ liệu không chứa đối tượng làm con trực tiếp của React
    const processedData = { ...response.data };

    // Duyệt qua dữ liệu để đảm bảo không có đối tượng làm con React
    Object.keys(processedData).forEach((row) => {
      Object.keys(processedData[row]).forEach((col) => {
        const seat = processedData[row][col];

        // Đảm bảo seat_status là chuỗi, không phải đối tượng
        if (seat.status && typeof seat.status === "object") {
          // Sử dụng type assertion để tránh lỗi TypeScript
          const statusObj = seat.status as any;
          seat.status = String(statusObj.seat_status || "available") as
            | "available"
            | "booked";
        }

        // Đảm bảo không có thuộc tính là đối tượng mà không được xử lý
        Object.keys(seat).forEach((key) => {
          // Sử dụng indexing với any type để TypeScript không báo lỗi
          const seatAny = seat as any;
          if (typeof seatAny[key] === "object" && seatAny[key] !== null) {
            // Chuyển đối tượng thành chuỗi hoặc giá trị đơn giản
            seatAny[key] = JSON.stringify(seatAny[key]);
          }
        });
      });
    });

    return processedData;
  } catch (error) {
    console.error("Get seats error:", error);
    throw handleApiError(error);
  }
};

// Update seat status
export const updateSeatStatus = async (
  seats: { seat_id: number; seat_status: string }[]
): Promise<SeatUpdateResponse> => {
  try {
    const response = await axios.post<SeatUpdateResponse>(
      ENDPOINTS.UPDATE_SEAT_STATUS,
      { seats }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Hold a single seat for booking
export const holdSeat = async (
  seatId: number
): Promise<{ message: string; seat: number; expires_at: string }> => {
  try {
    const response = await axios.post(ENDPOINTS.HOLD_SEAT, { seat: seatId });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Release a held seat
export const releaseSeat = async (
  seatId: number
): Promise<{ message: string; seat: number }> => {
  try {
    const response = await axios.post(ENDPOINTS.RELEASE_SEAT, { seat: seatId });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Hold multiple seats for booking
export const holdSelectedSeats = async (
  seatIds: number[]
): Promise<{ message: string; held_seats: any }> => {
  try {
    const response = await axios.post(ENDPOINTS.HOLD_SELECTED_SEATS, {
      seats: seatIds,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create a new seat
export const createSeat = async (
  seatData: SeatCreateRequest
): Promise<{ message: string; data: Seat }> => {
  try {
    // Kiểm tra các trường bắt buộc
    if (!seatData.room_id) {
      throw new Error("Thiếu room_id");
    }

    if (!seatData.row || seatData.row.length > 20) {
      throw new Error("Hàng không hợp lệ (tối đa 20 ký tự)");
    }

    if (!seatData.column || seatData.column.length > 10) {
      throw new Error("Cột không hợp lệ (tối đa 10 ký tự)");
    }

    if (!seatData.seat_type_id) {
      throw new Error("Thiếu seat_type_id");
    }

    // QUAN TRỌNG: SeatController yêu cầu trường seat_status
    const validatedSeatData = {
      ...seatData,
      seat_status: seatData.seat_status || "available",
    };

    console.log("Dữ liệu ghế gửi đi:", validatedSeatData);

    try {
      // Thử gửi với seat_status
      const response = await axios.post(
        ENDPOINTS.CREATE_SEAT,
        validatedSeatData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (innerError) {
      console.error("Lỗi khi tạo ghế với seat_status:", innerError);

      // Nếu gặp lỗi về cột seat_status không tồn tại, thử lại không có seat_status
      if (
        axios.isAxiosError(innerError) &&
        innerError.response?.status === 500 &&
        innerError.response?.data?.message?.includes("Column not found")
      ) {
        // Thử lại không có seat_status
        console.log("Thử lại không có seat_status");
        const { seat_status, ...dataWithoutStatus } = validatedSeatData;
        const fallbackResponse = await axios.post(
          ENDPOINTS.CREATE_SEAT,
          dataWithoutStatus,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        return fallbackResponse.data;
      } else {
        throw innerError;
      }
    }
  } catch (error: any) {
    console.error("Create seat error:", error);

    // Phân tích lỗi chi tiết
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      console.error("Chi tiết lỗi:", responseData);

      if (error.response.status === 422) {
        // Lỗi validation
        if (responseData.error && typeof responseData.error === "object") {
          const validationErrors = Object.entries(responseData.error)
            .map(([field, messages]) => `${field}: ${messages}`)
            .join(", ");
          throw new Error(`Lỗi validation: ${validationErrors}`);
        }
      }
    }

    throw handleApiError(error);
  }
};

// Update an existing seat
export const updateSeat = async (
  seatId: number,
  seatData: SeatUpdateRequest
): Promise<{ message: string; data: Seat }> => {
  try {
    const response = await axios.put(ENDPOINTS.UPDATE_SEAT(seatId), seatData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete a seat
export const deleteSeat = async (
  seatId: number
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(ENDPOINTS.DELETE_SEAT(seatId));
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete all seats in a room
export const deleteAllSeatsInRoom = async (
  roomId: number
): Promise<{ message: string }> => {
  try {
    // Thử sử dụng phương thức deleteAll từ controller
    try {
      const response = await axios.delete(
        ENDPOINTS.DELETE_ALL_SEATS_IN_ROOM(roomId)
      );
      return response.data;
    } catch (firstError) {
      console.error("Lỗi khi sử dụng endpoint chính:", firstError);

      // Thử phương pháp khác: xóa từng ghế một
      const seatsResponse = await axios.get(
        ENDPOINTS.GET_SEATS_BY_ROOM(roomId)
      );
      const seats = seatsResponse.data;

      // Xóa từng ghế một
      const seatIds: number[] = [];
      Object.keys(seats).forEach((row) => {
        Object.keys(seats[row]).forEach((col) => {
          const seat = seats[row][col];
          if (seat && seat.id) {
            seatIds.push(seat.id);
          }
        });
      });

      // Xóa từng ghế nếu có ghế để xóa
      if (seatIds.length > 0) {
        await Promise.all(
          seatIds.map((id) => axios.delete(ENDPOINTS.DELETE_SEAT(id)))
        );
      }

      return { message: "Xóa tất cả ghế trong phòng thành công" };
    }
  } catch (error) {
    console.error("Delete all seats error:", error);
    throw handleApiError(error);
  }
};

// Lấy tất cả các loại ghế
export const getSeatTypes = async (): Promise<SeatType[]> => {
  try {
    // API seat-types có thể không tồn tại, sẵn sàng trả về mặc định
    try {
      const response = await axios.get<SeatType[]>(`${BASE_URL}/seat-types`);
      console.log("Lấy seat types thành công:", response.data);
      return response.data;
    } catch (apiError) {
      console.error("Lỗi khi gọi API seat-types:", apiError);

      // Nếu API không tồn tại, trả về mặc định
      console.log("Dùng dữ liệu mặc định cho seat types");
      return DEFAULT_SEAT_TYPES;
    }
  } catch (error) {
    console.error("Get seat types error:", error);
    // Trả về mảng mặc định để tránh lỗi
    return DEFAULT_SEAT_TYPES;
  }
};

// Common API error handling function
const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error) && error.response) {
    const { data, status } = error.response;
    return {
      error: data.error || data.message || "Có lỗi xảy ra!",
      message: data.message,
      details: data.details || data.errors,
      status,
    };
  }
  return {
    error: "Lỗi không xác định!",
  };
};

// Export all service functions
export default {
  getSeats,
  holdSeat,
  holdSelectedSeats,
  releaseSeat,
  updateSeatStatus,
  createSeat,
  updateSeat,
  deleteSeat,
  deleteAllSeatsInRoom,
  getSeatTypes,
};
