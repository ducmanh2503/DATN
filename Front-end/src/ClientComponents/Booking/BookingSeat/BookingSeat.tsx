import { useEffect, useState } from "react";
import "./BookingSeat.css";
import { Card, Tooltip, Button } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import pusher from "../../../utils/pusher";

interface SeatType {
    id: number;
    roomId: number;
    row: string;
    column: string;
    seatCode: string; // Ghép từ row + column
    seatType: string; // Lấy từ bảng `seat_types.name`
    price: number; // Lấy từ bảng `seat_type_price`
    dayType: "weekday" | "weekend" | "holiday";
}

const BookingSeat = ({ className }: any) => {
    const {
        setNameSeats,
        setQuantitySeats,
        nameSeats,
        setTotalSeatPrice,
        totalSeatPrice,
        setTotalPrice,
        roomIdFromShowtimes,
        showtimeIdFromBooking,
        setHoldSeatId,
        holdSeatId,
        setHandleContinue,
        selectedSeatIds,
        setSelectedSeatIds,
    } = useMessageContext();
    const [seats, setSeats] = useState<Record<string, { isHeld?: boolean }>>(
        {}
    );

    // Lấy token từ localStorage
    const token = localStorage.getItem("auth_token");

    //api giữ ghế
    const holdSeatMutation = useMutation({
        mutationFn: async (seatIds: number[]) => {
            const { data } = await axios.post(
                `http://localhost:8000/api/hold-seats`,
                {
                    seats: seatIds, // Gửi danh sách ID ghế (số)
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return data;
        },
        onSuccess: (data) => {
            setSeats((prevSeats: any) => {
                const updatedSeats = { ...prevSeats };
                if (data.seats && typeof data.seats === "object") {
                    Object.keys(data.seats).forEach((seatKey) => {
                        updatedSeats[seatKey] = {
                            ...updatedSeats[seatKey],
                            status: "held",
                            isHeld: true,
                            heldByUser: true,
                        };
                    });
                }
                return updatedSeats;
            });
        },
    });

    // api sơ đồ ghế
    const { data: matrixSeats } = useQuery({
        queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/get-seats-for-booking/${roomIdFromShowtimes}/${showtimeIdFromBooking}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("check-matrix", data);

            return data;
        },
    });

    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const handleSeatClick = (seat: SeatType) => {
        // Thêm biến này vào context hoặc trong component
        console.log("get-seat", seat.id);
        setHoldSeatId(seat.id);

        // Xử lý tên ghế (seatCode) như trước
        setNameSeats((prevSeats: string[]) => {
            let updatedSeats: string[];
            let updatedTotalPrice: number = Number(totalSeatPrice);

            if (prevSeats.includes(seat.seatCode)) {
                // Bỏ chọn ghế
                updatedSeats = prevSeats.filter(
                    (seatCode: string) => seatCode !== seat.seatCode
                );
                updatedTotalPrice -= Number(seat.price);

                // Cũng cập nhật mảng ID
                setSelectedSeatIds((prev) =>
                    prev.filter((id) => id !== seat.id)
                );
            } else {
                // Chọn thêm ghế
                updatedSeats = [...prevSeats, seat.seatCode];
                updatedTotalPrice += Number(seat.price);

                // Thêm ID vào mảng
                setSelectedSeatIds((prev: any) => [...prev, seat.id]);
            }

            setQuantitySeats(updatedSeats.length);
            setTotalSeatPrice(updatedTotalPrice);
            return updatedSeats;
        });
    };

    const handleContinue = () => {
        // Gửi mảng ID ghế đã chọn
        holdSeatMutation.mutate(selectedSeatIds);
    };

    useEffect(() => {
        setTotalPrice(totalSeatPrice);
    }, [totalSeatPrice, setTotalPrice]);

    // lấy ID của user
    const { data: getUserId } = useQuery({
        queryKey: ["getUserId"],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:8000/api/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("check- user-id", data);
            return data.id;
        },
    });

    const userId = getUserId || null;

    //hold time
    const [seats, setSeats] = useState<Record<string, { isHeld?: boolean }>>(
        {}
    );

    useEffect(() => {
        // Đảm bảo pusher được cấu hình đúng
        console.log("Đăng ký kênh 'seats'");

        const channel = pusher.subscribe("seats");

        channel.bind("pusher:subscription_succeeded", () => {
            console.log("Đã đăng ký thành công kênh 'seats'");
        });

        // Thêm hàm này trong component BookingSeat
        const findSeatCodeById = (
            seatId: number,
            matrixData: any
        ): string | null => {
            if (!matrixData) return null;

            // Duyệt qua tất cả các hàng ghế
            for (const rowKey in matrixData) {
                const row = matrixData[rowKey];
                // Duyệt qua tất cả các ghế trong hàng
                for (const seatKey in row) {
                    const seat = row[seatKey];
                    if (seat.id === seatId) {
                        return seat.seatCode;
                    }
                }
            }
            return null;
        };

        channel.bind("seat-held", (data: any) => {
            console.log("🔴 Dữ liệu nhận từ Pusher:", data);

            // Kiểm tra cấu trúc dữ liệu
            let seatsArray: any[] = [];

            // Trường hợp 1: data.seats là mảng trực tiếp
            if (Array.isArray(data.seats)) {
                seatsArray = data.seats;
            }
            // Trường hợp 2: data.seats.seats là mảng (cấu trúc lồng nhau)
            else if (data.seats && Array.isArray(data.seats.seats)) {
                seatsArray = data.seats.seats;
            }
            // Xử lý dữ liệu nếu tìm thấy mảng ghế
            if (seatsArray.length > 0) {
                setSeats((prevSeats = {}) => {
                    const newSeats = { ...prevSeats };

                    seatsArray.forEach((seatId: any) => {
                        // Tìm mã ghế từ ID
                        let seatCode = findSeatCodeById(seatId, matrixSeats);

                        if (seatCode) {
                            newSeats[seatCode] = {
                                ...(prevSeats?.[seatCode] || {}),
                                status: "held",
                                isHeld: true,
                                heldByUser: data.userId === userId,
                            };
                        }
                    });

                    console.log("Cập nhật chỗ ngồi:", newSeats);
                    return newSeats;
                });
            } else {
                console.error("Không tìm thấy mảng ghế trong dữ liệu:", data);
            }
        });

        return () => {
            console.log("Hủy đăng ký kênh 'seats'");
            channel.unbind("seat-held");
            pusher.unsubscribe("seats");
        };
    }, [userId]);

    return (
        <div className={`box-main-left ${className}`}>
            <div className="box-showtimes">
                <span className="change-showtimes">Đổi suất chiếu:</span>
                <span>13:00</span>
                <span>13:00</span>
                <span>13:00</span>
                <span>13:00</span>
                <span>13:00</span>
            </div>
            <div className={`booking-seat `}>
                <div>
                    <Card>
                        <div className="screen">MÀN HÌNH</div>

                        <div className="matrix-seat">
                            {matrixSeats &&
                                Object.entries(matrixSeats).map(
                                    ([rowLabel, rowData]: any, rowIndex) => (
                                        <div
                                            key={rowLabel}
                                            className="row-seats"
                                        >
                                            {/* Hiển thị ký tự hàng (A, B, C, ...) */}
                                            <div className="col-seats">
                                                {rowLabel}
                                            </div>

                                            {/* Duyệt qua từng ghế trong hàng */}
                                            {Object.values(rowData).map(
                                                (seat: any) => {
                                                    const isSelected =
                                                        nameSeats.includes(
                                                            seat.seatCode
                                                        );
                                                    return (
                                                        <button
                                                            className="seat-name"
                                                            key={seat.id}
                                                            onClick={() =>
                                                                handleSeatClick(
                                                                    seat
                                                                )
                                                            }
                                                            disabled={
                                                                seats?.[
                                                                    seat
                                                                        .seatCode
                                                                ]?.isHeld
                                                            } // Nếu ghế đang giữ, disable button
                                                            style={{
                                                                background:
                                                                    seats?.[
                                                                        seat
                                                                            .seatCode
                                                                    ]?.isHeld
                                                                        ? "rgb(241, 153, 2)" // Màu cam nếu ghế đang giữ
                                                                        : nameSeats.includes(
                                                                              seat.seatCode
                                                                          )
                                                                        ? "#52c41a"
                                                                        : "transparent",
                                                                border:
                                                                    seat.type ===
                                                                    "VIP"
                                                                        ? "1px solid #1890ff"
                                                                        : seat.type ===
                                                                          "Sweetbox"
                                                                        ? "1px solid #f5222d"
                                                                        : "1px solid #8c8c8c",
                                                                color:
                                                                    seat.type ===
                                                                    "VIP"
                                                                        ? "#1890ff"
                                                                        : seat.type ===
                                                                          "Sweetbox"
                                                                        ? "#f5222d"
                                                                        : "black",
                                                                cursor: seats?.[
                                                                    seat
                                                                        .seatCode
                                                                ]?.isHeld
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                                opacity:
                                                                    seats?.[
                                                                        seat
                                                                            .seatCode
                                                                    ]?.isHeld
                                                                        ? 0.6
                                                                        : 1, // Làm mờ nếu ghế bị giữ
                                                            }}
                                                        >
                                                            {seat.seatCode}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )
                                )}
                        </div>

                        {/* Nút "Tiếp tục" */}
                        <Button
                            type="primary"
                            onClick={handleContinue}
                            disabled={nameSeats.length === 0}
                        >
                            Tiếp tục
                        </Button>
                    </Card>
                </div>
                <pre>{JSON.stringify(seats, null, 2)}</pre>
            </div>
        </div>
    );
};

export default BookingSeat;
