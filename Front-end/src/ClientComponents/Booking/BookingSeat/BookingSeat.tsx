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
import { useSeatSelection } from "../ValidateSeats/ValidateSeats";
import { useComboContext } from "../../UseContext/CombosContext";

const BookingSeat = ({ className }: { className?: string }) => {
    const {
        setNameSeats,
        setQuantitySeats,
        nameSeats,
        setTotalSeatPrice,
        totalSeatPrice,
        setTypeSeats,
        setHoldSeatId,
        setSelectedSeatIds,
        seats,
        setSeats,
        setMatrixSeatsManage,
    } = useSeatsContext();
    const { setTotalPrice, totalPrice } = useFinalPriceContext();
    const { roomIdFromShowtimes, showtimeIdFromBooking } = useFilmContext();
    const { tokenUserId } = useAuthContext();
    const { setUserIdFromShowtimes, userIdFromShowtimes, currentStep } =
        useStepsContext();
    const { totalComboPrice } = useComboContext();

    const queryClient = useQueryClient();
    const [isPusherRegistered, setIsPusherRegistered] = useState(false);
    const pusherEventHandlersRegistered = useRef(false);
    const pollingIntervalRef = useRef<number | null>(null);

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
    }, [getUserId]);

    // api lấy ma trận ghế
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
                        headers: { Authorization: `Bearer ${tokenUserId}` },
                    }
                );
                // console.log("ma trận ghế", data);

                return data;
            } catch (error) {
                console.error("🚨 Lỗi khi lấy thông tin ghế:", error);
                return null;
            }
        },
        staleTime: 1000 * 60,
        enabled:
            !!roomIdFromShowtimes && !!showtimeIdFromBooking && !!tokenUserId,
    });

    useEffect(() => {
        if (matrixSeats !== undefined) {
            setMatrixSeatsManage(matrixSeats ?? null);
        }
    }, [matrixSeats]);

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

    // gán các giá trị của ghế để hiển thị
    const handleSeatClick = (seat: BookingType) => {
        setHoldSeatId(seat.id);

        setTypeSeats((prevSeats: any[]) => {
            if (!Array.isArray(prevSeats)) prevSeats = [];

            // Kiểm tra ghế đã tồn tại trong danh sách chưa
            const existingSeatIndex = prevSeats.findIndex(
                (s) => s.type === seat.type
            );

            if (existingSeatIndex !== -1) {
                // Nếu ghế cùng loại đã có
                const updatedSeats = prevSeats.map((s, index) => {
                    if (index === existingSeatIndex) {
                        // Nếu ghế đã có, kiểm tra xem seatCode đã tồn tại chưa
                        const seatExists = s.seatCode
                            .split(", ")
                            .includes(seat.seatCode);

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

                // Xoá ghế nếu số lượng bằng 0
                return updatedSeats.filter((s) => s.quantitySeats > 0);
            } else {
                // Nếu ghế loại này chưa có, thêm mới
                return [
                    ...prevSeats,
                    {
                        quantitySeats: 1,
                        type: seat.type,
                        seatCode: seat.seatCode,
                        price: parseInt(seat.price),
                    },
                ];
            }
        });

        // Kiểm tra trạng thái ghế đã giữ hay đã đặt chưa
        if (
            seats[seat.seatCode]?.isHeld ||
            seat.status === "held" ||
            seat.status === "booked"
        ) {
            alert("Ghế này đã được giữ, không thể chọn");
            return;
        }

        // Cập nhật danh sách ghế và tổng giá
        setNameSeats((prevSeats: string[]) => {
            let updatedSeats: string[];
            let updatedTotalPrice: number = Number(totalSeatPrice);

            if (prevSeats.includes(seat.seatCode)) {
                // Bỏ chọn ghế
                updatedSeats = prevSeats.filter(
                    (seatCode: string) => seatCode !== seat.seatCode
                );
                updatedTotalPrice -= Number(seat.price);
                setSelectedSeatIds((prev: any) =>
                    prev.filter((id: any) => id !== seat.id)
                );
            } else {
                // Chọn thêm ghế
                updatedSeats = [...prevSeats, seat.seatCode];
                updatedTotalPrice += Number(seat.price);
                setSelectedSeatIds((prev: any) => [...prev, seat.id]);
            }

            setQuantitySeats(updatedSeats.length);

            setTotalSeatPrice(updatedTotalPrice);

            return updatedSeats;
        });
    };

    const handleSeatUpdateEvent = useCallback(
        (event: CustomEvent) => {
            const data = event.detail;
            if (data.userId !== userIdFromShowtimes) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "matrixSeats",
                        roomIdFromShowtimes,
                        showtimeIdFromBooking,
                    ],
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
        if (totalComboPrice && currentStep === 1) {
            setTotalPrice(totalPrice);
        } else {
            setTotalPrice(totalSeatPrice);
        }
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
                    !initialSeats[seatCode]?.isHeld ||
                    initialSeats[seatCode]?.heldByUser
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
        if (
            !roomIdFromShowtimes ||
            !showtimeIdFromBooking ||
            isPusherRegistered
        ) {
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
                                message.info(
                                    `Ghế ${seatCodes} vừa được người khác chọn`
                                );
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
                                        heldByUser:
                                            data.userId === userIdFromShowtimes,
                                    };
                                }
                            });
                            return newSeats;
                        });

                        if (data.userId !== userIdFromShowtimes) {
                            setNameSeats((prevNameSeats: any) => {
                                const updatedSeats = prevNameSeats.filter(
                                    (seatCode: any) => {
                                        for (const seatId of seatsArray) {
                                            if (
                                                findSeatCodeById(seatId) ===
                                                seatCode
                                            ) {
                                                return false;
                                            }
                                        }
                                        return true;
                                    }
                                );

                                if (
                                    updatedSeats.length !== prevNameSeats.length
                                ) {
                                    setQuantitySeats(updatedSeats.length);
                                    let newPrice = 0;
                                    updatedSeats.forEach((seatCode: any) => {
                                        if (matrixSeats) {
                                            for (const row in matrixSeats) {
                                                for (const col in matrixSeats[
                                                    row
                                                ]) {
                                                    const seat =
                                                        matrixSeats[row][col];
                                                    if (
                                                        seat.seatCode ===
                                                        seatCode
                                                    ) {
                                                        newPrice += Number(
                                                            seat.price
                                                        );
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
                                prev.filter(
                                    (id: any) => !seatsArray.includes(id)
                                )
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
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("focus", handleFocus);
        };
    }, [refetchMatrix]);

    // interface Seat {
    //     id: number;
    //     seatCode: string;
    //     type: string;
    //     status: string;
    // }

    // interface SeatMatrixProps {
    //     matrixSeats: Record<string, Seat[]>; // Dữ liệu ghế theo hàng
    // }
    // const SeatMatrix = ({ matrixSeats }: SeatMatrixProps) => {
    //     const { selectedSeats, toggleSeat } = useSeatSelection();
    // };
    return (
        <div className={clsx(styles.boxMainLeft, className)}>
            <div className={clsx(styles.boxShowtimes)}>
                <span className={clsx(styles.changeShowtimes)}>
                    Đổi suất chiếu:
                </span>
                <span>13:00</span>
                <span>13:00</span>
                <span>13:00</span>
                <span>13:00</span>
                <span>13:00</span>
            </div>
            <div className={clsx(styles.bookingSeat)}>
                <div>
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
                                            <div
                                                className={clsx(
                                                    styles.colSeats
                                                )}
                                            >
                                                {rowLabel}
                                            </div>
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
                                                        seat.status ===
                                                            "held" ||
                                                        seat.status ===
                                                            "booked";

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
                                                            onClick={() =>
                                                                handleSeatClick(
                                                                    seat
                                                                )
                                                            }
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
                        <div className={clsx(styles.bookingSeatsInfo)}>
                            <div className={clsx(styles.flexBooking)}>
                                <div className={clsx(styles.seatsInfo)}>
                                    <div
                                        className={clsx(
                                            styles.bookingSeats,
                                            styles.seatsBooked
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            styles.bookingSeatsName
                                        )}
                                    >
                                        Ghế đã đặt
                                    </span>
                                </div>
                                <div className={clsx(styles.seatsInfo)}>
                                    <div
                                        className={clsx(
                                            styles.bookingSeats,
                                            styles.seatsSelecting
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            styles.bookingSeatsName
                                        )}
                                    >
                                        Ghế đang chọn
                                    </span>
                                </div>
                                <div className={clsx(styles.seatsInfo)}>
                                    <div
                                        className={clsx(
                                            styles.bookingSeats,
                                            styles.seatsHolding
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            styles.bookingSeatsName
                                        )}
                                    >
                                        Ghế đang được giữ
                                    </span>
                                </div>
                            </div>
                            <div className={clsx(styles.flexBooking)}>
                                <div className={clsx(styles.seatsInfo)}>
                                    <div
                                        className={clsx(
                                            styles.bookingSeats,
                                            styles.seatsNormal
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            styles.bookingSeatsName
                                        )}
                                    >
                                        Ghế thường
                                    </span>
                                </div>
                                <div className={clsx(styles.seatsInfo)}>
                                    <div
                                        className={clsx(
                                            styles.bookingSeats,
                                            styles.seatsVIP
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            styles.bookingSeatsName
                                        )}
                                    >
                                        Ghế VIP
                                    </span>
                                </div>
                                <div className={clsx(styles.seatsInfo)}>
                                    <div
                                        className={clsx(
                                            styles.bookingSeats,
                                            styles.seatSweetbox
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            styles.bookingSeatsName
                                        )}
                                    >
                                        Ghế sweatbox
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookingSeat;
