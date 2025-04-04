import { useCallback } from "react";

// Chuyển đổi mã ghế ("A1") thành { row: 0, col: 1 }
const parseSeatCode = (seatCode: string) => {
    const [_, rowLetter, col] = seatCode.match(/([A-Z]+)(\d+)/) || [];
    const row = rowLetter.charCodeAt(0) - 65; // "A" -> 0, "B" -> 1
    return { row, col: parseInt(col, 10) };
};

const useIsolatedSeatChecker = () => {
    const checkIsolatedSeat = useCallback(
        (selectedSeats: string[], allSeats: any) => {
            // debugger;
            if (selectedSeats.length === 0) return false;

            const minCol = 1;
            const maxCol = 13;
            const maxRow = Object.keys(allSeats).length + 1;

            // Kiểm tra ghế có bị chiếm hay không (tránh truy cập ngoài mảng)
            const isOccupied = (r: number, c: number) => {
                if (
                    r < 0 ||
                    r > maxRow ||
                    c < minCol ||
                    c > maxCol ||
                    !allSeats?.[r] ||
                    !allSeats[r].hasOwnProperty(c)
                ) {
                    return false;
                }
                return (
                    selectedSeats.includes(
                        `${String.fromCharCode(65 + r)}${c}`
                    ) ||
                    allSeats[r][c].isHeld ||
                    allSeats[r][c].status === "held" ||
                    allSeats[r][c].status === "Booked" ||
                    allSeats[r][c].adminStatus === "empty" ||
                    allSeats[r][c].adminStatus === "disabled"
                );
            };

            // Chuyển đổi mã ghế thành đối tượng { row, col }
            const parsedSeats = selectedSeats.map(parseSeatCode);

            // Sắp xếp lại theo hàng và cột
            parsedSeats.sort((a, b) => a.col - b.col);

            for (let i = 0; i < parsedSeats.length; i++) {
                const { row, col } = parsedSeats[i];

                // Kiểm tra ghế bên trái và phải
                const isAtLeftEdge = col === minCol;
                const isAtRightEdge = col === maxCol;

                const left1 = !isAtLeftEdge && isOccupied(row, col - 1);
                const left2 = col - 2 >= minCol && isOccupied(row, col - 2);

                const right1 = !isAtRightEdge && isOccupied(row, col + 1);
                const right2 =
                    col + 2 <= maxCol ? isOccupied(row, col + 2) : false;

                if (!left1 && left2) return true; // A1 booked, A2 trống, A3 chọn

                // Bỏ qua kiểm tra góc trái nếu bắt đầu từ minCol
                if (col === minCol) {
                    // Kiểm tra trường hợp ghế lẻ ở góc trái
                    if (!right1 && isOccupied(row, col + 2)) {
                        return true; // Ghế lẻ ở minCol
                    }
                    return false;
                }

                // Kiểm tra đặc biệt cho ghế cạnh góc (trừ khi ở minCol/maxCol)
                if (col === minCol + 1 && !left1) return true; // Bỏ trống A1

                // bỏ trống A13 hoặc A13 là các trạng thái khác
                if (col === maxCol - 1 && !right1) {
                    const rightSeatCode = `${String.fromCharCode(65 + row)}${
                        col + 1
                    }`;

                    // Kiểm tra nếu ghế cuối cùng đã được chọn hoặc đã bị đặt/trống/disabled
                    if (
                        selectedSeats.includes(rightSeatCode) ||
                        allSeats?.[row]?.[col + 1]?.status === "Booked" ||
                        allSeats?.[row]?.[col + 1]?.adminStatus === "empty" ||
                        allSeats?.[row]?.[col + 1]?.adminStatus === "disabled"
                    ) {
                        continue;
                    }

                    return true;
                }

                // Kiểm tra ghế lẻ ở giữa
                if ((!left1 && left2) || (!right1 && right2)) {
                    return true; // Ghế lẻ
                }

                // Kiểm tra ghế lẻ trong khoảng trống giữa các ghế được chọn
                if (i < parsedSeats.length - 1) {
                    const nextCol = parsedSeats[i + 1].col;

                    // Nếu có khoảng trống (ít nhất 1 ghế chưa chọn)
                    if (nextCol - col > 1) {
                        for (let j = col + 1; j < nextCol; j++) {
                            const isPrevOccupied = isOccupied(row, j - 1);
                            const isNextOccupied = isOccupied(row, j + 1);

                            // Nếu ghế trống và hai bên bị chiếm => Ghế lẻ
                            if (
                                !isOccupied(row, j) &&
                                (isPrevOccupied || isNextOccupied)
                            ) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false; // Không có ghế lẻ
            // debugger;
        },
        []
    );

    return { checkIsolatedSeat };
};

export default useIsolatedSeatChecker;
