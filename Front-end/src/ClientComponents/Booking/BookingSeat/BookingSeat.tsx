import { useEffect, useState, useCallback, useRef } from "react";
import "./BookingSeat.css";
import { Card, Tooltip, message } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  status?: string;
  heldByCurrentUser?: boolean;
}

const BookingSeat = ({
  className,
  onContinue,
  onSeatHoldSuccess, // Thêm prop để nhận callback
}: {
  className?: string;
  onContinue: (handler: () => void) => void;
  onSeatHoldSuccess?: () => void; // Callback sau khi giữ ghế thành công
}) => {
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
    selectedSeatIds,
    setSelectedSeatIds,
    shouldRefetch,
    setShouldRefetch,
  } = useMessageContext();

  const token = localStorage.getItem("auth_token");
  const queryClient = useQueryClient();

  const [seats, setSeats] = useState<
    Record<string, { isHeld?: boolean; heldByUser?: boolean }>
  >({});
  const [isPusherRegistered, setIsPusherRegistered] = useState(false);
  const pusherEventHandlersRegistered = useRef(false);
  const pollingIntervalRef = useRef<number | null>(null);

  const { data: getUserId } = useQuery({
    queryKey: ["getUserId"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data.id;
      } catch (error) {
        console.error("Lỗi khi lấy userId:", error);
        return null;
      }
    },
    enabled: !!token,
  });

  const userId = getUserId || null;

  const forceDataRefresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
    });
    setShouldRefetch(true);
  }, [queryClient, roomIdFromShowtimes, showtimeIdFromBooking]);

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
        return data;
      } catch (error) {
        console.error("🚨 Lỗi khi lấy thông tin ghế:", error);
        return null;
      }
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
    cacheTime: 0,
    enabled: !!roomIdFromShowtimes && !!showtimeIdFromBooking && !!token,
  });

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
        if (seat.status === "held" || seat.status === "booked") {
          initialSeats[seat.seatCode] = {
            isHeld: true,
            heldByUser: seat.heldByCurrentUser || false,
          };
        }
      }
    }

    setSeats(initialSeats);

    setNameSeats((prevNameSeats: string[]) => {
      const updatedSeats = prevNameSeats.filter(
        (seatCode) =>
          !initialSeats[seatCode]?.isHeld || initialSeats[seatCode]?.heldByUser
      );

      if (updatedSeats.length !== prevNameSeats.length) {
        let newPrice = 0;
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

    setSelectedSeatIds((prev: any) => {
      const validIds = prev.filter((id: any) => {
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
    setSelectedSeatIds,
  ]);

  const holdSeatMutation = useMutation({
    mutationFn: async (seatIds: number[]) => {
      const { data } = await axios.post(
        "http://localhost:8000/api/hold-seats",
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
      message.success("Đã giữ ghế thành công!");
      queryClient.invalidateQueries({
        queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
      });
      setShouldRefetch(true);

      try {
        const eventData = {
          timestamp: new Date().getTime(),
          seats: selectedSeatIds,
          action: "hold",
          userId: userId,
        };
        localStorage.setItem("seat_update", JSON.stringify(eventData));
        const updateEvent = new CustomEvent("seatUpdateEvent", {
          detail: eventData,
        });
        window.dispatchEvent(updateEvent);
      } catch (e) {
        console.error("Lỗi khi lưu vào localStorage:", e);
      }

      // Gọi callback để chuyển bước sau khi giữ ghế thành công
      if (onSeatHoldSuccess) {
        onSeatHoldSuccess();
      }
    },
    onError: (error) => {
      console.error("🚨 Lỗi khi giữ ghế:", error);
      message.error("Không thể giữ ghế. Vui lòng thử lại!");
    },
  });

  const handleSeatClick = (seat: SeatType) => {
    setHoldSeatId(seat.id);

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
        updatedSeats = prevSeats.filter(
          (seatCode: string) => seatCode !== seat.seatCode
        );
        updatedTotalPrice -= Number(seat.price);
        setSelectedSeatIds((prev: any) =>
          prev.filter((id: any) => id !== seat.id)
        );
      } else {
        updatedSeats = [...prevSeats, seat.seatCode];
        updatedTotalPrice += Number(seat.price);
        setSelectedSeatIds((prev: any) => [...prev, seat.id]);
      }

      setQuantitySeats(updatedSeats.length);
      setTotalSeatPrice(updatedTotalPrice);
      return updatedSeats;
    });
  };

  const handleContinue = () => {
    console.log("🔵 Ghế đang giữ: ", selectedSeatIds);

    if (selectedSeatIds.length === 0) {
      console.warn("⚠ Không có ghế nào được chọn!");
      message.warning("Vui lòng chọn ít nhất một ghế!");
      return;
    }

    holdSeatMutation.mutate(selectedSeatIds);
  };

  const handleSeatUpdateEvent = useCallback(
    (event: CustomEvent) => {
      const data = event.detail;
      if (data.userId !== userId) {
        queryClient.invalidateQueries({
          queryKey: ["matrixSeats", roomIdFromShowtimes, showtimeIdFromBooking],
        });
        refetchMatrix();
      }
    },
    [
      queryClient,
      roomIdFromShowtimes,
      showtimeIdFromBooking,
      userId,
      refetchMatrix,
    ]
  );

  useEffect(() => {
    setTotalPrice(totalSeatPrice);
  }, [totalSeatPrice, setTotalPrice]);

  useEffect(() => {
    if (shouldRefetch) {
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

  useEffect(() => {
    updateSeatStates();
  }, [matrixSeats, updateSeatStates]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "seat_update") {
        try {
          const data = JSON.parse(e.newValue || "{}");
          if (data.userId !== userId) {
            queryClient.invalidateQueries({
              queryKey: [
                "matrixSeats",
                roomIdFromShowtimes,
                showtimeIdFromBooking,
              ],
              refetchType: "active",
            });
            refetchMatrix();
          }
        } catch (error) {
          console.error("Lỗi khi xử lý sự kiện storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
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
    refetchMatrix,
  ]);

  useEffect(() => {
    if (!roomIdFromShowtimes || !showtimeIdFromBooking || isPusherRegistered) {
      return;
    }

    const channelName = `seats.${roomIdFromShowtimes}.${showtimeIdFromBooking}`;
    if (pusher.channel(channelName)) {
      pusher.unsubscribe(channelName);
    }

    const channel = pusher.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      setIsPusherRegistered(true);

      if (!pusherEventHandlersRegistered.current) {
        channel.bind("seat-held", (data: any) => {
          let seatsArray: number[] = [];
          if (Array.isArray(data.seats)) {
            seatsArray = data.seats;
          } else if (data.seats && Array.isArray(data.seats.seats)) {
            seatsArray = data.seats.seats;
          } else if (Array.isArray(data)) {
            seatsArray = data;
          }

          if (seatsArray.length > 0) {
            if (data.userId !== userId) {
              const seatCodes = seatsArray
                .map((seatId) => findSeatCodeById(seatId))
                .filter(Boolean)
                .join(", ");
              if (seatCodes) {
                message.info(`Ghế ${seatCodes} vừa được người khác chọn`);
              }
              refetchMatrix();
            }

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

            if (data.userId !== userId) {
              setNameSeats((prevNameSeats: any) => {
                const updatedSeats = prevNameSeats.filter((seatCode: any) => {
                  for (const seatId of seatsArray) {
                    if (findSeatCodeById(seatId) === seatCode) {
                      return false;
                    }
                  }
                  return true;
                });

                if (updatedSeats.length !== prevNameSeats.length) {
                  setQuantitySeats(updatedSeats.length);
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

              setSelectedSeatIds((prev: any) =>
                prev.filter((id: any) => !seatsArray.includes(id))
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
    isPusherRegistered,
    refetchMatrix,
  ]);

  useEffect(() => {
    if (!userId) return;

    const userChannelName = `user.${userId}`;
    const userChannel = pusher.subscribe(userChannelName);

    userChannel.bind("hold-seat-ack", (data: any) => {
      refetchMatrix();
    });

    return () => {
      userChannel.unbind("hold-seat-ack");
      pusher.unsubscribe(userChannelName);
    };
  }, [userId, refetchMatrix]);

  useEffect(() => {
    if (roomIdFromShowtimes && showtimeIdFromBooking) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = window.setInterval(() => {
        refetchMatrix();
      }, 5000) as unknown as number;

      refetchMatrix();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [roomIdFromShowtimes, showtimeIdFromBooking, refetchMatrix]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchMatrix();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const handleFocus = () => refetchMatrix();
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchMatrix]);

  useEffect(() => {
    if (onContinue) {
      onContinue(handleContinue);
    }
  }, [onContinue, selectedSeatIds, holdSeatMutation]);

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
      <div className="booking-seat">
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
                      <div className="col-seats">{rowLabel}</div>
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
                                ? "rgb(241, 153, 2)"
                                : isSelected
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
                              cursor: isHeld ? "not-allowed" : "pointer",
                              opacity: isHeld ? 0.6 : 1,
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingSeat;
