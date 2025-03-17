import { useCallback } from "react";
import { useSeatsContext } from "../../UseContext/SeatsContext";

const useSeatValidation = () => {
    const { selectedSeatIds } = useSeatsContext();
    const validateSeats = useCallback(
        (selectedSeatIds: any, seatMatrix: any) => {
            for (let rowIndex = 0; rowIndex < seatMatrix.length; rowIndex++) {
                const row = seatMatrix[rowIndex];
                const seatPositions = Object.values(row);

                // Lọc ra các ghế đã chọn trong hàng này
                const selectedSeatsInRow = seatPositions.filter((seat) =>
                    selectedSeatIds.includes(seat.id)
                );

                // Nếu không có ghế nào được chọn trong hàng, bỏ qua
                if (selectedSeatsInRow.length === 0) continue;

                // Kiểm tra ghế liền kề
                for (let i = 0; i < seatPositions.length; i++) {
                    const currentSeat = seatPositions[i];
                    const leftSeat = seatPositions[i - 1];
                    const rightSeat = seatPositions[i + 1];

                    // Kiểm tra nếu ghế này được chọn
                    if (selectedSeatIds.includes(currentSeat.id)) {
                        // Kiểm tra trường hợp ghế trống lẻ
                        const isLeftEmpty =
                            leftSeat &&
                            leftSeat.status === "available" &&
                            !selectedSeatIds.includes(leftSeat.id);

                        const isRightEmpty =
                            rightSeat &&
                            rightSeat.status === "available" &&
                            !selectedSeatIds.includes(rightSeat.id);

                        // Không cho phép nếu có ghế trống lẻ ở hai bên
                        if (isLeftEmpty && isRightEmpty) {
                            return false;
                        }
                    }
                }
            }

            return true; // Hợp lệ nếu không phát hiện ghế trống lẻ
        },
        []
    );

    return { validateSeats };
};

export default useSeatValidation;
