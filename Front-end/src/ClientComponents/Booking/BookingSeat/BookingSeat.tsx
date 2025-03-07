import { useEffect, useState } from "react";
import "./BookingSeat.css";
import { Card, Tooltip } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import pusher from "../../../utils/pusher";

interface SeatType {
    id: string;
    seatCode: string;
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
        roomIdFromShowtimes,
        showtimeIdFromBooking,
    } = useMessageContext();

    // test api sơ đồ ghế
    const { data: matrixSeats } = useQuery({
        queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/get-seats-for-booking/${roomIdFromShowtimes}/${showtimeIdFromBooking}`
            );
            console.log("check-matrix", data);

            return data;
        },
    });

    const handleSeatClick = (seat: SeatType) => {
        setNameSeats((prevSeats: any) => {
            let updatedSeats: string[];
            let updatedTotalPrice: number = Number(totalSeatPrice); // Đảm bảo là số

            if (prevSeats.includes(seat.seatCode)) {
                updatedSeats = prevSeats.filter(
                    (seatCode: string) => seatCode !== seat.seatCode
                );
                updatedTotalPrice -= Number(seat.price); // Giữ nguyên số thực
            } else {
                updatedSeats = [...prevSeats, seat.seatCode];
                updatedTotalPrice += Number(seat.price);
            }

            setQuantitySeats(updatedSeats.length); // Không cần parseInt vì đã là number
            setTotalSeatPrice(updatedTotalPrice); // Cập nhật tổng tiền
            return updatedSeats;
        });
    };

    useEffect(() => {
        setTotalPrice(totalSeatPrice);
    }, [totalSeatPrice, setTotalPrice]);

    // lấy ID của user
    const { data: getUserId } = useQuery({
        queryKey: ["getUserId"],
        queryFn: async () => {
            let token = localStorage.getItem("access_token");
            const { data } = await axios.get(`http://localhost:8000/api/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("check- user-id", data);
        },
    });

    //hold time
    const [seats, setSeats] = useState({});

    // useEffect(() => {
    //     // Kết nối đến kênh Pusher
    //     const channel = pusher.subscribe("seats");

    //     // Lắng nghe sự kiện cập nhật ghế
    //     channel.bind("SeatHeldEvent", (data: any) => {
    //         console.log("Cập nhật ghế:", data);

    //         // Cập nhật danh sách ghế theo thời gian thực
    //         setSeats((prevSeats) => ({
    //             ...prevSeats,
    //             [data.seat]: {
    //                 ...prevSeats[data.seat],
    //                 status: data.user_id ? "held" : "available",
    //                 isHeld: !!data.user_id,
    //                 heldByUser: data.user_id === YOUR_USER_ID,
    //             },
    //         }));
    //     });

    //     return () => {
    //         channel.unbind_all();
    //         channel.unsubscribe();
    //     };
    // }, []);

    return (
        <>
            <div className={`booking-seat ${className}`}>
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
                                                            style={{
                                                                background:
                                                                    isSelected
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
                                    <span>Ghế đã đặt</span>
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
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            background: "rgb(241, 153, 2)",
                                            border: "2px solid rgb(241, 153, 2)",
                                        }}
                                    />
                                    <span>Ghế đang được giữ</span>
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
                <pre>{JSON.stringify(seats, null, 2)}</pre>
            </div>
        </>
    );
};

export default BookingSeat;
