import { useState } from "react";
import { useSeatsContext } from "../../UseContext/SeatsContext";

interface Seat {
    id: number;
    seatCode: string;
    type: string;
    status: string;
}

// Custom hook quản lý chọn ghế
export const useSeatSelection = () => {
    const { nameSeats, setNameSeats } = useSeatsContext();
    const [seatType, setSeatType] = useState<string | null>(null);

    // Kiểm tra ghế có hợp lệ không
    const isValidSeat = (seat: Seat) => {
        if (seat.status === "held" || seat.status === "booked") return false;

        // 1. Kiểm tra hàng dọc
        const selectedColumns = nameSeats.map((s: any) => s.seatCode.slice(1)); // Lấy số ghế
        const newColumn = seat.seatCode.slice(1);
        if (selectedColumns.includes(newColumn)) {
            alert("Không được chọn ghế theo hàng dọc!");
            return false;
        }

        // 2. Kiểm tra loại ghế
        if (seatType && seat.type !== seatType) {
            alert("Không được chọn ghế khác loại!");
            return false;
        }

        return true;
    };

    // Xử lý khi chọn hoặc bỏ chọn ghế
    const toggleSeat = (seat: Seat) => {
        if (!isValidSeat(seat)) return;

        // Nếu đã chọn thì bỏ chọn, chưa chọn thì thêm vào
        setNameSeats((prev: any) =>
            prev.find((s: any) => s.id === seat.id)
                ? prev.filter((s: any) => s.id !== seat.id)
                : [...prev, seat]
        );

        // Cập nhật loại ghế khi chọn ghế đầu tiên
        if (nameSeats.length === 0) setSeatType(seat.type);
    };

    // Reset trạng thái chọn ghế
    const resetSelection = () => {
        setNameSeats([]);
        setSeatType(null);
    };

    return {
        nameSeats,
        toggleSeat,
        resetSelection,
        isValidSeat,
    };
};
