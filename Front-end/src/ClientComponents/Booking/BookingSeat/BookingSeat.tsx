import { useEffect, useState, useCallback, useRef } from "react";
import "./BookingSeat.css";
import { Card, Tooltip, Button, message } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import pusher from "../../../utils/pusher";
import { set } from "react-hook-form";

interface SeatType {
  id: number;
  roomId: number;
  row: string;
  column: string;
  seatCode: string;
  seatType: string;
  price: number;
  dayType: "weekday" | "weekend" | "holiday";
  status?: string;
  heldByCurrentUser?: boolean;
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
    setUserIdFromShowtimes,
    shouldRefetch,
    setShouldRefetch,
  } = useMessageContext();

  // Lấy token từ localStorage
  const token = localStorage.getItem("auth_token");

  // Tạo state để theo dõi trạng thái của các ghế
  const [seats, setSeats] = useState<
    Record<string, { isHeld?: boolean; heldByUser?: boolean }>
  >({});
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  // State để theo dõi kênh Pusher đã được đăng ký
  const [isPusherRegistered, setIsPusherRegistered] = useState(false);

  // Ref để theo dõi trạng thái đăng ký Pusher event handlers
  const pusherEventHandlersRegistered = useRef(false);

  // Thêm ref để lưu trữ interval ID của polling
  const pollingIntervalRef = useRef<number | null>(null);
  // Thêm Query Client để thao tác với cache
  const queryClient = useQueryClient();

  const handleContinue = () => {
    console.log("🔵 Ghế đang giữ: ", selectedSeatIds);

    if (selectedSeatIds.length === 0) {
      console.warn("⚠ Không có ghế nào được chọn!");
      message.warning("Vui lòng chọn ít nhất một ghế!");
      return;
    }

    holdSeatMutation.mutate(selectedSeatIds);
  };
  // API giữ ghế
  const holdSeatMutation = useMutation({
    mutationFn: async (seatIds: number[]) => {
      const { data } = await axios.post(
        `http://localhost:8000/api/hold-seats`,
        {
          seats: seatIds,
          room_id: roomIdFromShowtimes,
          showtime_id: showtimeIdFromBooking,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: (data) => {
      console.log("✅ API giữ ghế thành công:", data);
      message.success("Đã giữ ghế thành công!");

      // Vô hiệu hóa cache để buộc lấy dữ liệu mới
      queryClient.invalidateQueries({
        queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
      });

      // Force refetch để đảm bảo dữ liệu mới nhất
      setShouldRefetch(true);

      // Broadcast một sự kiện tới cửa sổ khác (nếu có) thông qua localStorage
      try {
        // Thêm timestamp để đảm bảo sự kiện được nhận diện là mới
        const eventData = {
          timestamp: new Date().getTime(),
          seats: selectedSeatIds,
          action: "hold",
          userId: userId,
        };

        localStorage.setItem("seat_update", JSON.stringify(eventData));

        // Kích hoạt một custom event cho các tab đang mở
        const updateEvent = new CustomEvent("seatUpdateEvent", {
          detail: eventData,
        });
        window.dispatchEvent(updateEvent);
      } catch (e) {
        console.error("Lỗi khi lưu vào localStorage:", e);
      }
    },
    onError: (error) => {
      console.error("🚨 Lỗi khi giữ ghế:", error);
      message.error("Không thể giữ ghế. Vui lòng thử lại!");
    },
  });

  // api sơ đồ ghế với refetch function có sẵn
  const { data: matrixSeats, refetch: refetchMatrix } = useQuery({
    queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
    queryFn: async () => {
      if (!roomIdFromShowtimes || !showtimeIdFromBooking) {
        return null;
      }

      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/get-seats-for-booking/${roomIdFromShowtimes}/${showtimeIdFromBooking}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("✅ Đã lấy dữ liệu ghế mới:", data);
        return data;
      } catch (error) {
        console.error("🚨 Lỗi khi lấy thông tin ghế:", error);
        return null;
      }
    },
    // Thêm options để đảm bảo dữ liệu luôn được cập nhật
    refetchOnWindowFocus: true,
    staleTime: 0,
    // Thêm caching policy để không giữ cache quá lâu
    cacheTime: 5000, // 5 giây
    enabled: !!roomIdFromShowtimes && !!showtimeIdFromBooking && !!token,
  });

  // Lấy ID của user
  const { data: getUserId } = useQuery({
    queryKey: ["getUserId"],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`http://localhost:8000/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("check-user-id", data);
        return data.id;
      } catch (error) {
        console.error("Lỗi khi lấy userId:", error);
        return null;
      }
    },
    enabled: !!token,
  });

  const userId = getUserId || null;
  // Hàm tìm mã ghế từ ID - sử dụng useCallback để tối ưu hóa
  const findSeatCodeById = useCallback(
    (seatId: number): string | null => {
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
    },
    [matrixSeats]
  );

  // Hàm tìm thông tin ghế từ ID - sử dụng useCallback để tối ưu hóa
  const findSeatById = useCallback(
    (seatId: number): SeatType | null => {
      if (!matrixSeats) return null;

      for (const rowKey in matrixSeats) {
        const row = matrixSeats[rowKey];
        for (const seatKey in row) {
          const seat = row[seatKey];
          if (seat.id === seatId) {
            return seat;
          }
        }
      }
      return null;
    },
    [matrixSeats]
  );

  // Hàm cập nhật trạng thái ghế - được tách riêng và sử dụng useCallback
  const updateSeatStates = useCallback(() => {
    if (!matrixSeats) return;

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

    console.log("🟣 Cập nhật trạng thái ghế:", initialSeats);
    setSeats(initialSeats);

    // Kiểm tra và loại bỏ các ghế đã bị giữ khỏi danh sách chọn
    setNameSeats((prevNameSeats: string[]) => {
      const updatedSeats = prevNameSeats.filter(
        (seatCode) =>
          !initialSeats[seatCode]?.isHeld || initialSeats[seatCode]?.heldByUser
      );

      // Nếu có ghế bị loại bỏ, cập nhật giá
      if (updatedSeats.length !== prevNameSeats.length) {
        let newPrice = 0;

        // Tính lại tổng giá từ các ghế còn lại
        updatedSeats.forEach((seatCode) => {
          for (const rowKey in matrixSeats) {
            const row = matrixSeats[rowKey];
            for (const seatKey in row) {
              const seat = row[seatKey];
              if (seat.seatCode === seatCode) {
                newPrice += Number(seat.price);
                break;
              }
            }
          }
        });

        setTotalSeatPrice(newPrice);
        setQuantitySeats(updatedSeats.length);
      }

      return updatedSeats;
    });

    // Cập nhật selectedSeatIds để chỉ giữ các ID ghế vẫn được chọn
    setSelectedSeatIds((prev) => {
      const validIds = prev.filter((id) => {
        const seatCode = findSeatCodeById(id);
        return (
          seatCode &&
          (!initialSeats[seatCode]?.isHeld ||
            initialSeats[seatCode]?.heldByUser)
        );
      });
      return validIds;
    });
  }, [
    matrixSeats,
    findSeatCodeById,
    setNameSeats,
    setQuantitySeats,
    setTotalSeatPrice,
  ]);

  // Xử lý click vào ghế
  const handleSeatClick = (seat: SeatType) => {
    console.log("get-seat", seat.id);
    setHoldSeatId(seat.id);

    // Kiểm tra xem ghế đã được giữ chưa
    if (
      seats[seat.seatCode]?.isHeld ||
      seat.status === "held" ||
      seat.status === "booked"
    ) {
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
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      } else {
        // Chọn thêm ghế
        updatedSeats = [...prevSeats, seat.seatCode];
        updatedTotalPrice += Number(seat.price);

        // Thêm ID vào mảng
        setSelectedSeatIds((prev) => [...prev, seat.id]);
      }

      setQuantitySeats(updatedSeats.length);
      setTotalSeatPrice(updatedTotalPrice);
      return updatedSeats;
    });
  };

  // Hàm xử lý sự kiện cập nhật ghế giữa các tab
  const handleSeatUpdateEvent = useCallback(
    (event: CustomEvent) => {
      const data = event.detail;
      console.log("📢 Nhận sự kiện seatUpdateEvent:", data);

      if (data.userId !== userId) {
        // Vô hiệu hóa cache ngay lập tức
        queryClient.invalidateQueries({
          queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
        });

        // Kích hoạt refetch
        setShouldRefetch(true);
      }
    },
    [queryClient, roomIdFromShowtimes, showtimeIdFromBooking, userId]
  );

  // Cập nhật tổng giá
  useEffect(() => {
    setTotalPrice(totalSeatPrice);
  }, [totalSeatPrice, setTotalPrice]);

  // Thêm useEffect để refetch khi có thay đổi
  useEffect(() => {
    if (shouldRefetch) {
      console.log("🔄 Đang cập nhật dữ liệu từ server...");
      refetchMatrix()
        .then(() => {
          console.log("✅ Đã cập nhật dữ liệu thành công");
        })
        .catch((error) => {
          console.error("🚨 Lỗi khi cập nhật dữ liệu:", error);
        })
        .finally(() => {
          setShouldRefetch(false);
        });
    }
  }, [shouldRefetch, refetchMatrix]);

  // Cập nhật trạng thái ghế khi matrixSeats thay đổi
  useEffect(() => {
    updateSeatStates();
  }, [matrixSeats, updateSeatStates]);

  // Tạo hàm refetch dữ liệu để sử dụng trong nhiều tình huống
  const forceDataRefresh = useCallback(() => {
    console.log("🔄 Force refetch dữ liệu...");
    // Vô hiệu hóa cache
    queryClient.invalidateQueries({
      queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
    });

    // Kích hoạt refetch
    setShouldRefetch(true);
  }, [queryClient, roomIdFromShowtimes, showtimeIdFromBooking]);

  // Lắng nghe sự kiện localStorage để đồng bộ giữa các tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "seat_update") {
        try {
          const data = JSON.parse(e.newValue || "{}");
          console.log("🔄 Nhận sự kiện từ tab khác qua localStorage:", data);

          // Chỉ tiến hành refetch nếu sự kiện không đến từ tab hiện tại
          if (data.userId !== userId) {
            forceDataRefresh();
          }
        } catch (error) {
          console.error("Lỗi khi xử lý sự kiện storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Đăng ký custom event cho cross-tab communication
    window.addEventListener(
      "seatUpdateEvent",
      handleSeatUpdateEvent as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "seatUpdateEvent",
        handleSeatUpdateEvent as EventListener
      );
    };
  }, [
    queryClient,
    roomIdFromShowtimes,
    showtimeIdFromBooking,
    userId,
    handleSeatUpdateEvent,
    forceDataRefresh,
  ]);

  // Đăng ký kênh Pusher để nhận cập nhật về ghế bị giữ
  useEffect(() => {
    if (!roomIdFromShowtimes || !showtimeIdFromBooking || isPusherRegistered) {
      return;
    }

    const channelName = `seats.${roomIdFromShowtimes}.${showtimeIdFromBooking}`;
    // console.log(`🔄 Đăng ký kênh Pusher: ${channelName}`);

    // Hủy đăng ký kênh cũ nếu có
    if (pusher.channel(channelName)) {
      pusher.unsubscribe(channelName);
    }

    const channel = pusher.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      // console.log(`✅ Đã đăng ký thành công kênh ${channelName}`);
      setIsPusherRegistered(true);

      // Đăng ký sự kiện chỉ một lần
      if (!pusherEventHandlersRegistered.current) {
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

          if (seatsArray.length > 0) {
            // Hiển thị thông báo về ghế đã được giữ
            if (data.userId !== userId) {
              // Tìm các mã ghế để hiển thị
              const seatCodes = seatsArray
                .map((seatId) => findSeatCodeById(seatId))
                .filter(Boolean)
                .join(", ");

              if (seatCodes) {
                message.info(`Ghế ${seatCodes} vừa được người khác chọn`);
              }

              // Vô hiệu hóa cache và force refetch
              forceDataRefresh();
            }

            // Cập nhật ngay lập tức trạng thái ghế trước khi refetch
            setSeats((prevSeats) => {
              const newSeats = { ...prevSeats };

              seatsArray.forEach((seatId) => {
                const seatCode = findSeatCodeById(seatId);
                if (seatCode) {
                  newSeats[seatCode] = {
                    isHeld: true,
                    heldByUser: data.userId === userId,
                  };
                }
              });

              return newSeats;
            });

            // Loại bỏ ghế đã giữ khỏi danh sách chọn (nếu không phải do người dùng hiện tại giữ)
            if (data.userId !== userId) {
              setNameSeats((prevNameSeats: any) => {
                const updatedSeats = prevNameSeats.filter((seatCode: any) => {
                  // Kiểm tra xem mã ghế có tương ứng với ID ghế nào trong mảng seatsArray không
                  for (const seatId of seatsArray) {
                    if (findSeatCodeById(seatId) === seatCode) {
                      return false; // Loại bỏ ghế này
                    }
                  }
                  return true; // Giữ lại ghế này
                });

                // Nếu có sự thay đổi, cập nhật số lượng và giá
                if (updatedSeats.length !== prevNameSeats.length) {
                  setQuantitySeats(updatedSeats.length);

                  // Tính lại tổng giá
                  let newPrice = 0;
                  updatedSeats.forEach((seatCode: any) => {
                    if (matrixSeats) {
                      for (const row in matrixSeats) {
                        for (const col in matrixSeats[row]) {
                          const seat = matrixSeats[row][col];
                          if (seat.seatCode === seatCode) {
                            newPrice += Number(seat.price);
                          }
                        }
                      }
                    }
                  });

                  setTotalSeatPrice(newPrice);
                }

                return updatedSeats;
              });

              // Cập nhật selectedSeatIds
              setSelectedSeatIds((prev) =>
                prev.filter((id) => !seatsArray.includes(id))
              );
            }
          }
        });

        pusherEventHandlersRegistered.current = true;
      }
    });

    channel.bind("pusher:subscription_error", (error: any) => {
      console.error(`🚨 Lỗi khi đăng ký kênh ${channelName}:`, error);
    });

    return () => {
      // console.log(`🛑 Hủy đăng ký kênh Pusher: ${channelName}`);
      channel.unbind("seat-held");
      pusher.unsubscribe(channelName);
      setIsPusherRegistered(false);
      pusherEventHandlersRegistered.current = false;
    };
  }, [
    roomIdFromShowtimes,
    showtimeIdFromBooking,
    userId,
    matrixSeats,
    findSeatCodeById,
    queryClient,
    isPusherRegistered,
    forceDataRefresh,
  ]);

  // Lắng nghe sự kiện hold-seat-ack từ server
  useEffect(() => {
    // Tạo kênh riêng cho người dùng hiện tại (nếu cần)
    if (!userId) return;

    const userChannelName = `user.${userId}`;
    // console.log(`🔄 Đăng ký kênh cá nhân: ${userChannelName}`);

    const userChannel = pusher.subscribe(userChannelName);

    userChannel.bind("hold-seat-ack", (data: any) => {
      console.log("✅ Nhận xác nhận giữ ghế:", data);
      forceDataRefresh();
    });

    return () => {
      // console.log(`🛑 Hủy đăng ký kênh cá nhân: ${userChannelName}`);
      userChannel.unbind("hold-seat-ack");
      pusher.unsubscribe(userChannelName);
    };
  }, [userId, forceDataRefresh]);

  // Thiết lập polling interval để cập nhật dữ liệu định kỳ
  useEffect(() => {
    // Chỉ thiết lập interval khi có đủ thông tin
    if (roomIdFromShowtimes && showtimeIdFromBooking) {
      // Xóa interval cũ nếu có
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Thiết lập interval mới (mỗi 10 giây)
      pollingIntervalRef.current = window.setInterval(() => {
        console.log("⏱️ Polling: Kiểm tra cập nhật từ server...");
        setShouldRefetch(true);
      }, 10000) as unknown as number;

      // Gọi fetch lần đầu khi component mount
      setShouldRefetch(true);
    }

    // Cleanup khi component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [roomIdFromShowtimes, showtimeIdFromBooking]);

  // Lắng nghe sự kiện visibility change để cập nhật dữ liệu khi tab được hiển thị lại
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Tab được hiển thị lại, cập nhật dữ liệu...");
        forceDataRefresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Gọi fetch khi tab được focus
    window.addEventListener("focus", forceDataRefresh);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", forceDataRefresh);
    };
  }, [forceDataRefresh]);

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
                      key={`row-${rowLabel}-${rowIndex}`}
                      className="row-seats"
                    >
                      {/* Hiển thị ký tự hàng (A, B, C, ...) */}
                      <div className="col-seats">{rowLabel}</div>

                      {/* Duyệt qua từng ghế trong hàng */}
                      {Object.values(rowData).map((seat: any) => {
                        const isSelected = nameSeats.includes(seat.seatCode);
                        const seatState = seats[seat.seatCode] || {};
                        const isHeld =
                          seatState.isHeld ||
                          seat.status === "held" ||
                          seat.status === "booked";

                        return (
                          <button
                            className="seat-name"
                            key={`seat-${seat.id}`}
                            onClick={() => handleSeatClick(seat)}
                            disabled={isHeld}
                            style={{
                              background: isHeld
                                ? "rgb(241, 153, 2)" // Màu cam nếu ghế đang giữ
                                : isSelected
                                ? "#52c41a" // Màu xanh nếu đang chọn
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
                              cursor: isHeld ? "not-allowed" : "pointer",
                              opacity: isHeld ? 0.6 : 1, // Làm mờ nếu ghế bị giữ
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
            <Button
              type="primary"
              onClick={handleContinue}
              disabled={nameSeats.length === 0 || holdSeatMutation.isPending}
              loading={holdSeatMutation.isPending}
            ></Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingSeat;
