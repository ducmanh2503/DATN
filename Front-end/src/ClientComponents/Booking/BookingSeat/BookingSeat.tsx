import { useEffect, useState, useCallback, useRef } from "react";
import { Card, message } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import pusher from "../../../utils/pusher";
import clsx from "clsx";
import { BookingType } from "../../../types/interface";
import styles from "./BookingSeat.module.css";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useFinalPriceContext } from "../../UseContext/FinalPriceContext";
import { useFilmContext } from "../../UseContext/FIlmContext";
import { useAuthContext } from "../../UseContext/TokenContext";
import { useStepsContext } from "../../UseContext/StepsContext";
import { useComboContext } from "../../UseContext/CombosContext";
import ChangeShowtimes from "../ChangeShowtimes/ChangeShowtimes";
import UISeatsInfo from "../UISeatsInfo/UISeatsInfo";
import CustomNotification from "../Notification/Notification";

const BookingSeat = ({ className }: { className?: string }) => {

    const {
        setNameSeats,
        nameSeats,
        setQuantitySeats,
        quantitySeats,
        setTotalSeatPrice,
        totalSeatPrice,
        setTypeSeats,
        typeSeats,
        setSelectedSeatIds,
        setMatrixSeatsManage,
    } = useSeatsContext();
    const { setTotalPrice } = useFinalPriceContext();
    const { roomIdFromShowtimes, showtimeIdFromBooking } = useFilmContext();
    const { tokenUserId } = useAuthContext();
    const { setUserIdFromShowtimes, userIdFromShowtimes, currentStep } =
        useStepsContext();
    const { totalComboPrice } = useComboContext();
    const { openNotification, contextHolder } = CustomNotification();

    const queryClient = useQueryClient();
    const [isPusherRegistered, setIsPusherRegistered] = useState(false);
    const pusherEventHandlersRegistered = useRef(false);
    const pollingIntervalRef = useRef<number | null>(null);
    const MAX_SEATS = 8;

    // api lấy userID
    const { data: getUserId } = useQuery({
        queryKey: ["getUserId"],
        queryFn: async () => {
            try {
                const { data } = await axios.get(
                    "http://localhost:8000/api/user",
                    {
                        headers: { Authorization: `Bearer ${tokenUserId}` },
                    }
                );
                return data.id;
            } catch (error) {
                console.error("Lỗi khi lấy userId:", error);
                return null;
            }
        },
        enabled: !!tokenUserId, // Chỉ chạy khi có token
    });

    // Cập nhật userId khi getUserId có dữ liệu
    useEffect(() => {
        if (getUserId !== undefined) {
            setUserIdFromShowtimes(getUserId ?? null);

        }
      }
      return null;
    },
    [matrixSeats]
  );

  // gán các giá trị của ghế để hiển thị
  const handleSeatClick = (seat: BookingType) => {
    setTypeSeats((prevSeats: any[]) => {
      if (!Array.isArray(prevSeats)) prevSeats = [];

      //validate ghế
      // Kiểm tra tổng số lượng ghế đã chọn
      const totalSeats = prevSeats.reduce((sum, s) => sum + s.quantitySeats, 0);

      // Nếu đạt giới hạn thì không cập nhật
      if (
        totalSeats >= MAX_SEATS &&
        !prevSeats.some((s) => s.seatCode.includes(seat.seatCode))
      ) {
        openNotification({
          description: `Bạn chỉ được đặt tối đa ${MAX_SEATS} ghế!`,
        });

        return prevSeats;
      } else {
        // không bị validate sẽ thực hiện gán các giá trị dưới đây
        setNameSeats((prevSeats: any) => {
          const updatedSeats = prevSeats.includes(seat.seatCode)
            ? prevSeats.filter((code: any) => code !== seat.seatCode)
            : [...prevSeats, seat.seatCode];

          // Cập nhật selectedSeatIds
          setSelectedSeatIds((prev: any) => {
            return updatedSeats
              .map((code: any) => {
                // Tìm seatId tương ứng với seatCode
                for (const row in matrixSeats) {
                  for (const col in matrixSeats[row]) {
                    if (matrixSeats[row][col].seatCode === code) {
                      return matrixSeats[row][col].id;
                    }
                  }
                }
                return null;
              })
              .filter((id: number) => id !== null);
          });

          return updatedSeats;
        });
      }

      // Kiểm tra ghế đã tồn tại trong danh sách chưa
      const existingSeatIndex = prevSeats.findIndex(
        (s) => s.type === seat.type
      );
      let updatedSeats;

      if (existingSeatIndex !== -1) {
        // Nếu ghế cùng loại đã có
        updatedSeats = prevSeats.map((s, index) => {
          if (index === existingSeatIndex) {
            const seatExists = s.seatCode.split(", ").includes(seat.seatCode);
            if (seatExists) {
              // Nếu đã tồn tại, bỏ chọn (giảm số lượng và trừ giá)
              const updatedSeatCodes = s.seatCode
                .split(", ")
                .filter((code: any) => code !== seat.seatCode)
                .join(", ");

              return {
                ...s,
                quantitySeats: s.quantitySeats - 1,
                price: s.price - parseInt(seat.price),
                seatCode: updatedSeatCodes,
              };
            } else {
              // Nếu chưa tồn tại, thêm mới
              return {
                ...s,
                quantitySeats: s.quantitySeats + 1,
                price: s.price + parseInt(seat.price),
                seatCode: `${s.seatCode}, ${seat.seatCode}`,
              };
            }
          }
          return s;
        });

    };


    // Kiểm tra trạng thái ghế đã giữ hay đã đặt chưa
    if (
      seats[seat.seatCode]?.isHeld ||
      seat.status === "held" ||
      seat.status === "booked"
    ) {
      alert("Ghế này đã được giữ, không thể chọn");
      return;
    }
  };

  // tính tổng tiền và số lượng ghế
  useEffect(() => {
    if (!Array.isArray(typeSeats) || typeSeats.length === 0) {
      setQuantitySeats(0);
      setTotalSeatPrice(0);
      return;
    }
    const totalSeats = typeSeats.reduce(
      (sum: any, s: any) => sum + s.quantitySeats,
      quantitySeats
    );
    const totalPrice = typeSeats.reduce(
      (sum: any, s: any) => sum + s.price,
      totalSeatPrice
    );

    setQuantitySeats(totalSeats);
    setTotalSeatPrice(totalPrice);
  }, [typeSeats]);

  const handleSeatUpdateEvent = useCallback(
    (event: CustomEvent) => {
      const data = event.detail;
      if (data.userId !== userIdFromShowtimes) {
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
      userIdFromShowtimes,
      refetchMatrix,
    ]
  );
  // gán tổng tiền ghế vào tiền tổng
  useEffect(() => {
    setTotalPrice(totalSeatPrice + totalComboPrice);
  }, [totalSeatPrice, totalComboPrice, currentStep]);

  useEffect(() => {
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

        setNameSeats((prevNameSeats: string[]) => {
            const updatedSeats = prevNameSeats.filter(
                (seatCode) =>
                    !initialSeats[seatCode]?.isHeld ||
                    initialSeats[seatCode]?.heldByUser
            );

            return updatedSeats;
        });
        setTypeSeats((prevTypeSeats: any[]) => {
            if (!prevTypeSeats) return [];

            return prevTypeSeats
                .map((seat) => {
                    // Tách danh sách mã ghế
                    const seatCodes = seat.seatCode.split(", ");

                    // Lọc bỏ các ghế đã bị giữ bởi người khác
                    const availableSeatCodes = seatCodes.filter(
                        (code: any) =>
                            !initialSeats[code]?.isHeld ||
                            initialSeats[code]?.heldByUser
                    );

                    // Nếu không còn ghế hợp lệ, loại bỏ khỏi danh sách
                    if (availableSeatCodes.length === 0) return null;

                    // Nếu có ghế còn lại, cập nhật lại thông tin ghế
                    return {
                        ...seat,
                        seatCode: availableSeatCodes.join(", "),
                        quantitySeats: availableSeatCodes.length,
                        price:
                            (seat.price / seatCodes.length) *
                            availableSeatCodes.length,
                    };
                })
                .filter(Boolean); // Loại bỏ các phần tử null
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
  }, [matrixSeats]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "seat_update") {
        try {
          const data = JSON.parse(e.newValue || "{}");
          if (data.userId !== userIdFromShowtimes) {
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
    userIdFromShowtimes,
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
            if (data.userId !== userIdFromShowtimes) {
              const seatCodes = seatsArray
                .map((seatId) => findSeatCodeById(seatId))
                .filter(Boolean)
                .join(", ");
              if (seatCodes) {
                message.info(`Ghế ${seatCodes} vừa được người khác chọn`);
              }
              refetchMatrix();
            }

            setSeats((prevSeats: any) => {
              const newSeats = { ...prevSeats };
              seatsArray.forEach((seatId) => {
                const seatCode = findSeatCodeById(seatId);
                if (seatCode) {
                  newSeats[seatCode] = {
                    isHeld: true,
                    heldByUser: data.userId === userIdFromShowtimes,
                  };
                }
              });
              return newSeats;
            });

            if (data.userId !== userIdFromShowtimes) {
              setNameSeats((prevNameSeats: any) => {
                const updatedSeats = prevNameSeats.filter((seatCode: any) => {
                  for (const seatId of seatsArray) {
                    if (findSeatCodeById(seatId) === seatCode) {
                      return false;
                    }
                  }
                  return true;
                });


                    if (seatsArray.length > 0) {
                        if (data.userId !== userIdFromShowtimes) {
                            // Thông báo ghế vừa bị giữ
                            const seatCodes = seatsArray
                                .map((seatId) => findSeatCodeById(seatId))
                                .filter(Boolean)
                                .join(", ");
                            if (seatCodes) {
                                message.info(
                                    `Ghế ${seatCodes} vừa được người khác chọn`
                                );
                            }

                            // Cập nhật lại ma trận ghế
                            refetchMatrix();

                        }
                      }
                    }

                });

                pusherEventHandlersRegistered.current = true;
            }
        });

        channel.bind("pusher:subscription_error", (error: any) => {
            console.error(`🚨 Lỗi khi đăng ký kênh ${channelName}:`, error);
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
    userIdFromShowtimes,
    matrixSeats,
    findSeatCodeById,
    isPusherRegistered,
    refetchMatrix,
  ]);

  useEffect(() => {
    if (!userIdFromShowtimes) return;

    const userChannelName = `user.${userIdFromShowtimes}`;
    const userChannel = pusher.subscribe(userChannelName);

    userChannel.bind("hold-seat-ack", (data: any) => {
      refetchMatrix();
    });

    return () => {
      userChannel.unbind("hold-seat-ack");
      pusher.unsubscribe(userChannelName);
    };
  }, [userIdFromShowtimes, refetchMatrix]);

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


    return (
        <div className={clsx(styles.boxMainLeft, className)}>
            {contextHolder}
            <ChangeShowtimes></ChangeShowtimes>
            <div className={clsx(styles.bookingSeat)}>
                <Card>
                    <div className={clsx(styles.screen)}>MÀN HÌNH</div>

                    <div className={clsx(styles.matrixSeat)}>
                        {matrixSeats &&
                            Object.entries(matrixSeats).map(
                                ([rowLabel, rowData]: any, rowIndex) => (
                                    <div
                                        key={`row-${rowLabel}-${rowIndex}`}
                                        className={clsx(styles.rowSeats)}
                                    >
                                        <div className={clsx(styles.colSeats)}>
                                            {numberToLetter(rowIndex + 1)}
                                        </div>

                                        {Object.values(rowData).map(
                                            (seat: any) => {
                                                const isSelected =
                                                    nameSeats.includes(
                                                        seat.seatCode
                                                    );
                                                const isHeld =
                                                    seat.status === "held" ||
                                                    seat.status === "booked";

                                                return (
                                                    <button
                                                        className={clsx(
                                                            styles.seatName,
                                                            isHeld &&
                                                                styles.held,
                                                            isSelected &&
                                                                styles.selected,
                                                            seat.type ===
                                                                "VIP" &&
                                                                styles.vip,
                                                            seat.type ===
                                                                "Sweetbox" &&
                                                                styles.sweetbox
                                                        )}
                                                        key={`seat-${seat.id}`}
                                                        onClick={() => {
                                                            handleSeatClick(
                                                                seat
                                                            );
                                                        }}
                                                        disabled={isHeld}
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
                    {Object.values(rowData).map((seat: any) => {
                      const isSelected = nameSeats.includes(seat.seatCode);
                      const seatState = seats[seat.seatCode] || {};
                      const isHeld =
                        seatState.isHeld ||
                        seat.status === "held" ||
                        seat.status === "booked";

                      return (
                        <button
                          className={clsx(
                            styles.seatName,
                            isHeld && styles.held,
                            isSelected && styles.selected,
                            seat.type === "VIP" && styles.vip,
                            seat.type === "Sweetbox" && styles.sweetbox
                          )}
                          key={`seat-${seat.id}`}
                          onClick={() => {
                            handleSeatClick(seat);
                          }}
                          disabled={isHeld}
                        >
                          {seat.seatCode}
                        </button>
                      );
                    })}
                  </div>
                )
              )}
          </div>
          <UISeatsInfo></UISeatsInfo>
        </Card>
      </div>
    </div>
  );
};

export default BookingSeat;
