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

  // Lấy token từ localStorage
  const token = localStorage.getItem("auth_token");

  //api giữ ghế
  const holdSeatMutation = useMutation({
    mutationFn: async (seatId: string) => {
      const { data } = await axios.post(
        `http://localhost:8000/api/hold-seats`,
        {
          seats: [seatId],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: (data) => {
      console.log("Ghế đã được giữ:", data);
      // Cập nhật trạng thái ghế dựa trên phản hồi từ API
      setSeats((prevSeats: any) => ({
        ...prevSeats,
        [data.seat]: {
          ...(prevSeats[data.seat] || {}),
          status: "held",
          isHeld: true,
          heldByUser: true,
        },
      }));
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
  const [seats, setSeats] = useState<Record<string, { isHeld?: boolean }>>({});

  useEffect(() => {
    const channel = pusher.subscribe("seats");

    channel.bind("seat-held", (data: any) => {
      console.log("Cập nhật ghế từ Pusher:", data);

      setSeats((prevSeats = {}) => {
        const newSeats = {
          ...prevSeats,
          [data.seat]: {
            ...(prevSeats?.[data.seat] || {}),
            status: data.user_id ? "held" : "available",
            isHeld: !!data.user_id,
            heldByUser: data.user_id === userId, // Nếu userId thay đổi thì cập nhật lại
          },
        };
        console.log("Ghế sau cập nhật:", newSeats);
        return newSeats;
      });
    });

    return () => {
      channel.unbind("seat-held"); // Chỉ unbind sự kiện cụ thể, không phải tất cả
      channel.unsubscribe();
    };
  }, [userId]); // 🛠️ Thêm userId để khi user thay đổi, sự kiện Pusher cũng cập nhật

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
                    <div key={rowLabel} className="row-seats">
                      {/* Hiển thị ký tự hàng (A, B, C, ...) */}
                      <div className="col-seats">{rowLabel}</div>

                      {/* Duyệt qua từng ghế trong hàng */}
                      {Object.values(rowData).map((seat: any) => {
                        const isSelected = nameSeats.includes(seat.seatCode);
                        return (
                          <button
                            className="seat-name"
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seats?.[seat.seatCode]?.isHeld} // Nếu ghế đang giữ, disable button
                            style={{
                              background: seats?.[seat.seatCode]?.isHeld
                                ? "rgb(241, 153, 2)" // Màu cam nếu ghế đang giữ
                                : nameSeats.includes(seat.seatCode)
                                ? "#52c41a"
                                : "transparent",
                              border:
                                seat.type === "VIP"
                                  ? "1px solid #1890ff"
                                  : seat.type === "Sweetbox"
                                  ? "1px solid #f5222d"
                                  : "1px solid #8c8c8c",
                              color:
                                seat.type === "VIP"
                                  ? "#1890ff"
                                  : seat.type === "Sweetbox"
                                  ? "#f5222d"
                                  : "black",
                              cursor: seats?.[seat.seatCode]?.isHeld
                                ? "not-allowed"
                                : "pointer",
                              opacity: seats?.[seat.seatCode]?.isHeld ? 0.6 : 1, // Làm mờ nếu ghế bị giữ
                            }}
                          >
                            {seat.seatCode}
                          </button>
                        );
                      })}
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
                  <span className="booking-seats-name">Ghế đã đặt</span>
                </div>
                <div className="seats-info">
                  <div
                    className="booking-seats "
                    style={{
                      background: "#52c41a",
                      border: "2px solid #52c41a",
                    }}
                  />
                  <span className="booking-seats-name">Ghế đang chọn</span>
                </div>
                <div className="seats-info">
                  <div
                    className="booking-seats "
                    style={{
                      background: "rgb(241, 153, 2)",
                      border: "2px solid rgb(241, 153, 2)",
                    }}
                  />
                  <span className="booking-seats-name">Ghế đang được giữ</span>
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
                  <span className="booking-seats-name">Ghế thường</span>
                </div>
                <div className="seats-info">
                  <div
                    className="booking-seats "
                    style={{
                      border: "2px solid #1890ff",
                    }}
                  />
                  <span className="booking-seats-name">Ghế VIP</span>
                </div>
                <div className="seats-info">
                  <div
                    className="booking-seats "
                    style={{
                      border: "2px solid #f5222d",
                    }}
                  />
                  <span className="booking-seats-name">Ghế sweatbox</span>
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
