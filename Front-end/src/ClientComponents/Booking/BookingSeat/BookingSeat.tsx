import { useEffect, useState } from "react";
import "./BookingSeat.css";
import { Card, Tooltip } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import { useMutation, useQuery } from "@tanstack/react-query";
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
    } = useMessageContext();
    const [forceUpdate, setForceUpdate] = useState(0);

    // Lấy token từ localStorage
    const token = localStorage.getItem("auth_token");

    //api giữ ghế
    const holdSeatMutation = useMutation({
        mutationFn: async (seatId: string) => {
            console.log("📡 Gửi API giữ ghế:", seatId);
            const { data } = await axios.post(
                `http://localhost:8000/api/hold-seats`,
                { seats: [seatId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ API giữ ghế phản hồi:", data);
            return data;
        },
        onSuccess: (data) => {
            console.log("✅ Ghế đã được giữ thành công:", data);
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

    const handleSeatClick = (seat: SeatType) => {
        console.log("get-seat", seat.id);
        setHoldSeatId(seat.id);

        // Gọi API giữ ghế khi bấm chọn ghế
        holdSeatMutation.mutate(seat.id);

        setNameSeats((prevSeats: any) => {
            console.log("dđ", prevSeats);

            let updatedSeats: string[];
            let updatedTotalPrice: number = Number(totalSeatPrice);

            if (prevSeats.includes(seat.seatCode)) {
                updatedSeats = prevSeats.filter(
                    (seatCode: string) => seatCode !== seat.seatCode
                );
                updatedTotalPrice -= Number(seat.price);
            } else {
                updatedSeats = [...prevSeats, seat.seatCode];
                updatedTotalPrice += Number(seat.price);
            }

            setQuantitySeats(updatedSeats.length);
            setTotalSeatPrice(updatedTotalPrice);
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
            const { data } = await axios.get(`http://localhost:8000/api/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("check- user-id", data);
            return data.id;
        },
    });

    const userId = getUserId || null;

    //hold time
    const [seats, setSeats] = useState<{
        [key: string]: { isHeld: boolean; heldByUser: boolean };
    }>({});

    useEffect(() => {
        console.log("🔍 Kiểm tra userId:", userId);
        if (!userId) return; // Không chạy nếu userId chưa có

        console.log("🟢 Đang kết nối Pusher...");
        const channel = pusher.subscribe("seats");

        pusher.connection.bind("connected", () => {
            console.log("✅ Pusher đã kết nối thành công!");
        });

        pusher.connection.bind("error", (err: any) => {
            console.error("❌ Lỗi kết nối Pusher:", err);
        });

        channel.bind("pusher:subscription_succeeded", () => {
            console.log("✅ Đã subscribe thành công vào channel seats!");
        });

        channel.bind("pusher:subscription_error", (status: any) => {
            console.error("❌ Lỗi khi subscribe vào channel seats:", status);
        });

        channel.bind("seat-held", (data: any) => {
            console.log("📡 Nhận dữ liệu từ Pusher:", data);
            if (!data || !data.seat) {
                console.error("❌ Dữ liệu không hợp lệ từ Pusher:", data);
                return;
            }

            setSeats((prevSeats = {}) => {
                console.log(
                    "⚡ Trạng thái seats trước khi cập nhật:",
                    prevSeats
                );
                console.log("checkkkk", data);

                const newSeats = {
                    ...prevSeats,
                    [data.seat]: {
                        ...(prevSeats?.[data.seat] || {}),
                        isHeld: !!data.id,
                        heldByUser: data.id === userId,
                    },
                };

                console.log("✅ Trạng thái seats sau khi cập nhật:", newSeats);
                return newSeats;
            });
        });

        return () => {
            channel.unbind("seat-held");
            channel.unsubscribe();
        };
    }, [userId]);

    const getSeatColor = (seat: any) => {
        // console.log("🔍 Kiểm tra seat:", seat);
        console.log("🟠 Trạng thái giữ:", seats[seat.seatCode]?.isHeld);
        // console.log("🟢 Trạng thái chọn:", nameSeats.includes(seat.seatCode));

        if (seats[seat.seatCode]?.isHeld) return "rgb(241, 153, 2)"; // Cam nếu giữ
        if (nameSeats.includes(seat.seatCode)) return "#52c41a"; // Xanh nếu đang chọn
        return "transparent"; // Mặc định
    };

    useEffect(() => {
        console.log("🟣 Trạng thái seats sau khi cập nhật:", seats);
        setForceUpdate((prev) => prev + 1);
    }, [seats]);

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
                                                                !!(
                                                                    seats[
                                                                        seat
                                                                            .seatCode
                                                                    ] &&
                                                                    seats[
                                                                        seat
                                                                            .seatCode
                                                                    ].isHeld
                                                                )
                                                            }
                                                            // Nếu ghế đang giữ, disable button
                                                            style={{
                                                                background:
                                                                    getSeatColor(
                                                                        seat
                                                                    ),
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
                                    <span className="booking-seats-name">
                                        Ghế đã đặt
                                    </span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            background: "#52c41a",
                                            border: "2px solid #52c41a",
                                        }}
                                    />
                                    <span className="booking-seats-name">
                                        Ghế đang chọn
                                    </span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            background: "rgb(241, 153, 2)",
                                            border: "2px solid rgb(241, 153, 2)",
                                        }}
                                    />
                                    <span className="booking-seats-name">
                                        Ghế đang được giữ
                                    </span>
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
                                    <span className="booking-seats-name">
                                        Ghế thường
                                    </span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            border: "2px solid #1890ff",
                                        }}
                                    />
                                    <span className="booking-seats-name">
                                        Ghế VIP
                                    </span>
                                </div>
                                <div className="seats-info">
                                    <div
                                        className="booking-seats "
                                        style={{
                                            border: "2px solid #f5222d",
                                        }}
                                    />
                                    <span className="booking-seats-name">
                                        Ghế sweatbox
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <pre>{JSON.stringify(seats, null, 2)}</pre>
            </div>
        </div>
    );
};

export default BookingSeat;
