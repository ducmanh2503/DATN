import clsx from "clsx";
import styles from "./ChangeShowtimes.module.css";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useFilmContext } from "../../UseContext/FIlmContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthContext } from "../../UseContext/TokenContext";
const ChangeShowtimes = () => {
    const {
        listShowtimes,
        filmId,
        setShowtimeIdFromBooking,
        showtimeIdFromBooking,
        roomIdFromShowtimes,
        setShowtimesTime,
    } = useFilmContext();
    const { tokenUserId } = useAuthContext();

    const {
        data: matrixSeats,
        isLoading: isLoadingMatrix,
        refetch: refetchMatrix,
    } = useQuery({
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

    const handleClick = (id: number, start_time: string) => {
        setShowtimeIdFromBooking(id); // tahy đổi dữ liệu để chạy lại api lấy ghế
        setShowtimesTime(start_time); // Cập nhật giá trị ở thông tin phim
        refetchMatrix();
    };
    return (
        <div className={clsx(styles.boxShowtimes)}>
            <span className={clsx(styles.changeShowtimes)}>
                Đổi suất chiếu:
            </span>

            {/* Hiển thị Spin khi đang load */}

            {listShowtimes
                .sort((a: any, b: any) =>
                    dayjs(a.start_time, "HH:mm:ss").isBefore(
                        dayjs(b.start_time, "HH:mm:ss")
                    )
                        ? -1
                        : 1
                )
                .map((item: any) => (
                    <div key={item.id}>
                        <Link
                            className={clsx(
                                styles.showtimesItem,
                                showtimeIdFromBooking === item.id
                                    ? styles.active
                                    : ""
                            )}
                            to={`/booking/${filmId}`}
                            onClick={() =>
                                handleClick(item.id, item.start_time)
                            }
                        >
                            {dayjs(item.start_time, "HH:mm:ss").format("HH:mm")}
                        </Link>
                    </div>
                ))}
        </div>
    );
};

export default ChangeShowtimes;
