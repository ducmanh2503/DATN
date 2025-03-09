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
    seatCode: string;
    seatType: string;
    price: number;
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
        setSelectedSeatIds,
    } = useMessageContext();

    // Lấy token từ localStorage
    const token = localStorage.getItem("auth_token");

    // Tạo state để theo dõi trạng thái của các ghế
    const [seats, setSeats] = useState<
        Record<string, { isHeld?: boolean; heldByUser?: boolean }>
    >({});

    // api sơ đồ ghế
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

    // Lấy ID của user
    const { data: getUserId } = useQuery({
        queryKey: ["getUserId"],
        queryFn: async () => {
            const { data } = await axios.get(`http://localhost:8000/api/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("check-user-id", data);
            return data.id;
        },
    });

    const userId = getUserId || null;

    // Hàm tìm mã ghế từ ID
    const findSeatCodeById = (seatId: number): string | null => {
        if (!matrixSeats) return null;

        for (const rowKey in matrixSeats) {
            const row = matrixSeats[rowKey];
            for (const seatKey in row) {
                const seat = row[seatKey];
                if (seat.id === seatId) {
                    return seat.seatCode;
                }
            }
        }
        return null;
    };

    // Xử lý click vào ghế
    const handleSeatClick = (seat: SeatType) => {
        console.log("get-seat", seat.id);
        setHoldSeatId(seat.id);

        // Kiểm tra xem ghế đã được giữ chưa
        if (seats[seat.seatCode]?.isHeld) {
            console.log("Ghế này đã được giữ, không thể chọn");
            return;
        }

        setNameSeats((prevSeats: string[]) => {
            let updatedSeats: string[];
            let updatedTotalPrice: number = Number(totalSeatPrice);

            if (prevSeats.includes(seat.seatCode)) {
                // Bỏ chọn ghế
                updatedSeats = prevSeats.filter(
                    (seatCode: string) => seatCode !== seat.seatCode
                );
                updatedTotalPrice -= Number(seat.price);

                // Cập nhật mảng ID
                setSelectedSeatIds((prev: any) =>
                    prev.filter((id: any) => id !== seat.id)
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

    // Cập nhật tổng giá
    useEffect(() => {
        setTotalPrice(totalSeatPrice);
    }, [totalSeatPrice, setTotalPrice]);

    // Đăng ký kênh Pusher để nhận cập nhật về ghế bị giữ
    useEffect(() => {
        if (!roomIdFromShowtimes || !showtimeIdFromBooking) {
            console.log(
                "Chưa có thông tin phòng hoặc suất chiếu, không thể đăng ký kênh Pusher"
            );
            return;
        }

        const channelName = `seats.${roomIdFromShowtimes}.${showtimeIdFromBooking}`;
        console.log(`🔄 Đăng ký kênh Pusher: ${channelName}`);

        // Hủy đăng ký kênh cũ nếu có
        if (pusher.channel(channelName)) {
            pusher.unsubscribe(channelName);
        }

        const channel = pusher.subscribe(channelName);

        channel.bind("pusher:subscription_succeeded", () => {
            console.log(`✅ Đã đăng ký thành công kênh ${channelName}`);
        });

        channel.bind("pusher:subscription_error", (error: any) => {
            console.error(`🚨 Lỗi khi đăng ký kênh ${channelName}:`, error);
        });

        // Lắng nghe sự kiện seat-held
        channel.bind("seat-held", (data: any) => {
            console.log(
                `🔴 Nhận sự kiện seat-held từ kênh ${channelName}:`,
                data
            );

            // Phân tích cấu trúc dữ liệu
            let seatsArray: number[] = [];

            // Trường hợp 1: data.seats là mảng trực tiếp
            if (Array.isArray(data.seats)) {
                seatsArray = data.seats;
            }
            // Trường hợp 2: data.seats.seats là mảng (cấu trúc lồng nhau)
            else if (data.seats && Array.isArray(data.seats.seats)) {
                seatsArray = data.seats.seats;
            }
            // Trường hợp 3: data là mảng trực tiếp
            else if (Array.isArray(data)) {
                seatsArray = data;
            }

            console.log("Danh sách ghế cần cập nhật:", seatsArray);

            if (seatsArray.length > 0) {
                setSeats((prevSeats) => {
                    const newSeats = { ...prevSeats };

                    seatsArray.forEach((seatId: number) => {
                        // Tìm mã ghế từ ID
                        const seatCode = findSeatCodeById(seatId);
                        console.log(`ID ghế ${seatId} => Mã ghế ${seatCode}`);

                        if (seatCode) {
                            newSeats[seatCode] = {
                                isHeld: true,
                                heldByUser: data.userId === userId,
                            };
                        }
                    });

                    console.log(
                        "🟢 Trạng thái ghế sau khi cập nhật:",
                        newSeats
                    );
                    return newSeats;
                });

                // Loại bỏ ghế đã giữ khỏi danh sách chọn (nếu không phải do người dùng hiện tại giữ)
                if (data.userId !== userId) {
                    setNameSeats((prevNameSeats: any) => {
                        let updatedSeats = [...prevNameSeats];
                        let updatedPrice = Number(totalSeatPrice);

                        seatsArray.forEach((seatId) => {
                            const seatCode = findSeatCodeById(seatId);
                            if (seatCode && updatedSeats.includes(seatCode)) {
                                updatedSeats = updatedSeats.filter(
                                    (s) => s !== seatCode
                                );

                                // Tìm giá của ghế để trừ
                                if (matrixSeats) {
                                    for (const row in matrixSeats) {
                                        for (const col in matrixSeats[row]) {
                                            const seat = matrixSeats[row][col];
                                            if (seat.seatCode === seatCode) {
                                                updatedPrice -= Number(
                                                    seat.price
                                                );
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        });

                        setTotalSeatPrice(updatedPrice);
                        setQuantitySeats(updatedSeats.length);
                        return updatedSeats;
                    });

                    // Cập nhật selectedSeatIds
                    setSelectedSeatIds((prev: any) => {
                        return prev.filter(
                            (id: any) => !seatsArray.includes(id)
                        );
                    });
                }
            } else {
                console.error(
                    "Không tìm thấy thông tin ghế trong dữ liệu:",
                    data
                );
            }
        });

        return () => {
            console.log(`🛑 Hủy đăng ký kênh Pusher: ${channelName}`);
            channel.unbind("seat-held");
            pusher.unsubscribe(channelName);
        };
    }, [roomIdFromShowtimes, showtimeIdFromBooking, userId, matrixSeats]);

    // Lắng nghe sự kiện hold-seat-ack từ server
    useEffect(() => {
        // Tạo kênh riêng cho người dùng hiện tại (nếu cần)
        if (!userId) return;

        const userChannelName = `user.${userId}`;
        console.log(`🔄 Đăng ký kênh cá nhân: ${userChannelName}`);

        const userChannel = pusher.subscribe(userChannelName);

        userChannel.bind("hold-seat-ack", (data: any) => {
            console.log("✅ Nhận xác nhận giữ ghế:", data);
            // Xử lý phản hồi từ server về việc giữ ghế thành công
        });

        return () => {
            console.log(`🛑 Hủy đăng ký kênh cá nhân: ${userChannelName}`);
            userChannel.unbind("hold-seat-ack");
            pusher.unsubscribe(userChannelName);
        };
    }, [userId]);

    // Lấy trạng thái ban đầu của các ghế từ API
    useEffect(() => {
        // Kiểm tra nếu có dữ liệu matrix và các ghế đã được giữ
        if (matrixSeats) {
            // Khởi tạo trạng thái ghế ban đầu
            const initialSeats: Record<
                string,
                { isHeld: boolean; heldByUser: boolean }
            > = {};

            for (const rowKey in matrixSeats) {
                const row = matrixSeats[rowKey];
                for (const seatKey in row) {
                    const seat = row[seatKey];
                    // Nếu status của ghế là "held" hoặc "booked", đánh dấu là đã giữ
                    if (seat.status === "held" || seat.status === "booked") {
                        initialSeats[seat.seatCode] = {
                            isHeld: true,
                            heldByUser: seat.heldByCurrentUser || false,
                        };
                    }
                }
            }

            console.log("🟣 Trạng thái ghế ban đầu:", initialSeats);
            setSeats(initialSeats);
        }
    }, [matrixSeats]);

    return (
        <div className={`box-main-left ${className}`}>
            <div className="box-showtimes">
                <span className="change-showtimes">Đổi suất chiếu:</span>
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
                                                    const seatState =
                                                        seats[seat.seatCode] ||
                                                        {};
                                                    const isHeld =
                                                        seatState.isHeld ||
                                                        false;

                                                    return (
                                                        <button
                                                            className="seat-name"
                                                            key={seat.id}
                                                            onClick={() =>
                                                                handleSeatClick(
                                                                    seat
                                                                )
                                                            }
                                                            disabled={isHeld}
                                                            style={{
                                                                background:
                                                                    isHeld
                                                                        ? "rgb(241, 153, 2)" // Màu cam nếu ghế đang giữ
                                                                        : isSelected
                                                                        ? "#52c41a" // Màu xanh nếu đang chọn
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
                                                                cursor: isHeld
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                                opacity: isHeld
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
                    </Card>
                </div>
                {/* Bảng debug (có thể bỏ khi chạy production) */}
                {/*<pre>{JSON.stringify(seats, null, 2)}</pre>*/}
            </div>
        </div>
    );
};

export default BookingSeat;
