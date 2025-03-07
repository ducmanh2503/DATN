import { useEffect, useState } from "react";
import "./BookingSeat.css";
import { Card, Tooltip } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
interface SeatType {
    id: string;
    type: "normal" | "vip" | "sweatbox" | "empty";
    seatNumber: string;
    price: number;
}
const BookingSeat = ({ className }: any) => {
    const [matrixSize, setMatrixSize] = useState({ rows: 10, cols: 16 });
    const {
        setNameSeats,
        setQuantitySeats,
        nameSeats,
        setTotalSeatPrice,
        totalSeatPrice,
        setTotalPrice,
    } = useMessageContext();

    const [matrix, setMatrix] = useState<SeatType[][]>(
        Array(matrixSize.rows)
            .fill(null)
            .map((_, rowIndex) =>
                Array(matrixSize.cols)
                    .fill(null)
                    .map((_, colIndex) => {
                        const rowLetter = String.fromCharCode(65 + rowIndex);
                        let seatType: SeatType["type"] = "normal";
                        let price = 100000; // Giá mặc định

                        if (["E", "F", "G"].includes(rowLetter)) {
                            seatType = "vip";
                            price = 150000;
                        } else if (["H", "I", "J"].includes(rowLetter)) {
                            seatType = "sweatbox";
                            price = 200000;
                        }

                        return {
                            id: `${rowLetter}${(colIndex + 1)
                                .toString()
                                .padStart(2, "0")}`,
                            type: seatType,
                            seatNumber: `${rowLetter}${(colIndex + 1)
                                .toString()
                                .padStart(2, "0")}`,
                            price,
                        };
                    })
            )
    );
    const handleSeatClick = (seat: SeatType) => {
        setNameSeats((prevSeats: any) => {
            let updatedSeats;
            let updatedTotalPrice = totalSeatPrice;
            if (prevSeats.includes(seat.id)) {
                updatedSeats = prevSeats.filter((id: any) => id !== seat.id);
                updatedTotalPrice -= seat.price;
            } else {
                updatedSeats = [...prevSeats, seat.id];
                updatedTotalPrice += seat.price;
            }

            setQuantitySeats(updatedSeats.length); // số lượng ghế
            setTotalSeatPrice(updatedTotalPrice); // tổng tiền ghế
            return updatedSeats;
        });
    };

    useEffect(() => {
        setTotalPrice(totalSeatPrice);
    }, [totalSeatPrice, setTotalPrice]);

    return (
        <>
            <div className={`booking-seat ${className}`}>
                <div>
                    <Card>
                        <div className="screen">MÀN HÌNH</div>

                        <div className="matrix-seat">
                            {matrix.map((row, rowIndex) => (
                                <div key={rowIndex} className="row-seats">
                                    <div className="col-seats">
                                        {String.fromCharCode(65 + rowIndex)}
                                    </div>
                                    {row.map((seat, colIndex) => {
                                        const isSelected = nameSeats.includes(
                                            seat.id
                                        );
                                        return (
                                            <button
                                                className="seat-name"
                                                key={seat.id}
                                                onClick={() =>
                                                    handleSeatClick(seat)
                                                }
                                                style={{
                                                    background: isSelected
                                                        ? "#52c41a" // Màu xanh lá khi được chọn
                                                        : "transparent", // Màu mặc định
                                                    border:
                                                        seat.type === "vip"
                                                            ? "1px solid #1890ff" // Màu xanh dương cho ghế VIP
                                                            : seat.type ===
                                                              "sweatbox"
                                                            ? "1px solid #f5222d" // Màu đỏ cho ghế sweatbox
                                                            : "1px solid #8c8c8c",
                                                    color:
                                                        seat.type === "vip"
                                                            ? "#1890ff"
                                                            : seat.type ===
                                                              "sweatbox"
                                                            ? "#f5222d"
                                                            : "black",
                                                }}
                                            >
                                                {colIndex + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="booking-seats-info">
                            <div className="flex-booking">
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            background: "rgb(166, 21, 210)",
                                            border: "2px solid rgb(166, 21, 210)",
                                        }}
                                    />
                                    <span>Ghế đã bán</span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            background: "#52c41a",
                                            border: "2px solid #52c41a",
                                        }}
                                    />
                                    <span>Ghế đang chọn</span>
                                </div>
                            </div>
                            <div className="flex-booking">
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            border: "2px solid #8c8c8c",
                                        }}
                                    />
                                    <span>Ghế thường</span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            border: "2px solid #1890ff",
                                        }}
                                    />
                                    <span>Ghế VIP</span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            border: "2px solid #f5222d",
                                        }}
                                    />
                                    <span>Ghế sweatbox</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default BookingSeat;
