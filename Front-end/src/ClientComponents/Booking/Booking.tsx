import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin } from 'antd';
import ClientLayout from "../../page/client/Layout";
import seatService from "../../services/seat.service";
import roomService from "../../services/room.service";
import { SeatingMatrix, SeatMatrixItem, SeatUpdateRequest } from "../../types/seat.types";
import { Room } from "../../types/room.types";
import "./Booking.css";

const Booking = () => {
    const { showtimeId, roomId } = useParams<{ showtimeId: string; roomId: string }>();
    const [seatingMatrix, setSeatingMatrix] = useState<SeatingMatrix>({});
    const [selectedSeats, setSelectedSeats] = useState<SeatMatrixItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [room, setRoom] = useState<Room | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadSeatsAndRoom = async () => {
            if (!roomId) {
                message.error("Không có ID phòng");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Tải ma trận ghế
                const seatsData = await seatService.getSeatsByRoom(parseInt(roomId, 10));
                setSeatingMatrix(seatsData);

                // Tải thông tin phòng
                const roomData = await roomService.getRoom(roomId);
                setRoom(roomData);
            } catch (error) {
                const errorMessage = (error as { error?: string }).error || 'Lỗi khi tải dữ liệu';
                message.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadSeatsAndRoom();
    }, [roomId]);

    const handleSeatClick = (seat: SeatMatrixItem) => {
        if (seat.status === "available") {
            setSelectedSeats(prev =>
                prev.some(s => s.id === seat.id)
                    ? prev.filter(s => s.id !== seat.id)
                    : [...prev, seat]
            );
        }
    };

    const handleBookTickets = async () => {
        if (!selectedSeats.length) {
            message.warning("Vui lòng chọn ít nhất một ghế!");
            return;
        }

        try {
            const seatsToUpdate: SeatUpdateRequest[] = selectedSeats.map(seat => ({
                seat_id: seat.id,
                seat_status: "booked"
            }));

            await seatService.updateSeatStatus(seatsToUpdate);

            const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
            navigate(`/payment/${showtimeId}`, {
                state: { selectedSeats, totalPrice }
            });
        } catch (error) {
            const errorMessage = (error as { error?: string }).error || 'Lỗi khi đặt vé';
            message.error(errorMessage);
        }
    };

    const renderSeatMatrix = () => {
        return Object.keys(seatingMatrix).sort().map(row => {
            const rowSeats = Object.values(seatingMatrix[row] || {}).sort((a, b) => {
                const getColumnNumber = (code: string) => parseInt(code.match(/\d+$/)?.[0] || '0', 10);
                return getColumnNumber(a.seatCode) - getColumnNumber(b.seatCode);
            });

            return (
                <div key={row} className="seat-row">
                    <div className="row-label">{row}</div>
                    {rowSeats.map(seat => (
                        <div
                            key={seat.seatCode}
                            className={`seat ${seat.status} ${
                                selectedSeats.some(s => s.id === seat.id) ? "selected" : ""
                            }`}
                            onClick={() => handleSeatClick(seat)}
                        >
                            <div className="seat-code">{seat.seatCode}</div>
                            <div className="seat-type">{seat.type}</div>
                            <div className="seat-price">{seat.price.toLocaleString()}đ</div>
                        </div>
                    ))}
                </div>
            );
        });
    };

    if (loading) {
        return (
            <ClientLayout>
                <div className="booking-container loading">
                    <Spin size="large" />
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="booking-container">
                <h1>Đặt vé - {room?.name || "Phòng chiếu"}</h1>
                <div className="seating-legend">
                    <div className="legend-item">
                        <div className="seat-sample available"></div>
                        <span>Ghế trống</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat-sample selected"></div>
                        <span>Ghế đang chọn</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat-sample booked"></div>
                        <span>Ghế đã đặt</span>
                    </div>
                </div>

                <div className="seating-chart">{renderSeatMatrix()}</div>

                <div className="booking-summary">
                    <h3>Ghế đã chọn ({selectedSeats.length})</h3>
                    <div className="selected-seats-list">
                        {selectedSeats.map(seat => (
                            <div key={seat.id} className="selected-seat-item">
                                <span>{seat.seatCode}</span>
                                <span>{seat.type}</span>
                                <span>{seat.price.toLocaleString()}đ</span>
                            </div>
                        ))}
                    </div>
                    <div className="total-price">
                        Tổng tiền: {selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toLocaleString()}đ
                    </div>
                    <button
                        className="book-button"
                        onClick={handleBookTickets}
                        disabled={selectedSeats.length === 0}
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
        </ClientLayout>
    );
};

export default Booking;