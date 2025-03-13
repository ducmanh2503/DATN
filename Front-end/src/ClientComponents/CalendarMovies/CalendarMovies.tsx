import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Skeleton, Spin } from "antd";
import clsx from "clsx";

import { GET_SHOW_BY_FILM_DATE } from "../../config/ApiConfig";
import BoxNumbers from "./BoxNumbers/BoxNumbers";
import BoxDay from "./BoxDays/BoxDay";
import styles from "./CalendarMovie.module.css";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useStepsContext } from "../UseContext/StepsContext";
import { useAuthContext } from "../UseContext/TokenContext";
import { useNavigate } from "react-router-dom";

const CalendarMovies = ({ id, setIsModalOpen2 }: any) => {
    const [searchDateRaw, setSearchDateRaw] = useState<string | null>(null);
    const [searchDateFormatted, setSearchDateFormatted] = useState<
        string | null
    >(null);
    const { setCalendarShowtimeID } = useStepsContext();
    const { setTokenUserId } = useAuthContext();
    const {
        setShowtimesTime,
        setShowtimesDate,
        setRoomIdFromShowtimes,
        setShowtimeIdFromBooking,
    } = useFilmContext();
    const { tokenUserId } = useAuthContext();
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (!tokenUserId && ) {
    //         {
    //             navigate("/auth/login");
    //         }
    //     }
    // }, [tokenUserId]);

    //lấy các ngày trong lịch chiếu của phim
    const { data: calendarMovie, isLoading: isLoadingCalendarMovie } = useQuery(
        {
            queryKey: ["calendarMovie", id],
            queryFn: async () => {
                const { data } = await axios.get(
                    `http://localhost:8000/api/calendar-show/date-range/${id}`
                );
                console.log("check-calendar", data);

                return data.show_dates;
            },
            staleTime: 1000 * 60 * 10,
            // enabled: setIsModalOpen2,
        }
    );

    const daysOfWeek = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
    ];

    // tìm suất chiếu với ngày trong lịch chiếu
    const { data: LoadShowByFilmAndDate, isLoading: isLoadingFilmAndDate } =
        useQuery({
            queryKey: ["LoadShowByFilmAndDate", searchDateRaw, id],
            queryFn: async () => {
                if (!searchDateRaw) return null;
                const { data } = await axios.get(
                    `${GET_SHOW_BY_FILM_DATE}/${id}/${searchDateRaw}`
                );
                console.log("test-data", data);

                return data.show_times;
            },
            enabled: !!searchDateRaw, // Chỉ gọi API khi có ngày hợp lệ
            staleTime: 1000 * 60,
            retry: false,
        });

    // format dữ liệu
    useEffect(() => {
        if (calendarMovie && calendarMovie.length > 0) {
            const firstDate = dayjs(calendarMovie[0]).format("YYYY-MM-DD");

            // Chỉ cập nhật nếu khác giá trị hiện tại
            if (searchDateRaw !== firstDate) {
                setSearchDateRaw(firstDate);
                setSearchDateFormatted(dayjs(firstDate).format("DD/MM"));
            }
        }
    }, [calendarMovie]);

    // reset-data khi vào suất chiếu mới
    // const resetBookingState = () => {
    //     setNameSeats([]);
    //     setCurrentStep(1);
    //     setShouldRefetch(false);
    //     setQuantitySeats(0);
    //     setRoomIdFromShowtimes(null);
    //     setShowtimeIdFromBooking(null);
    // };

    // useEffect(() => {
    //     resetBookingState();
    // }, [roomIdFromShowtimes]);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            setTokenUserId(token);
        }
    }, []);

    const handleShowtimeClick = (
        item: any,
        setRoomIdFromShowtimes: (id: number) => void,
        setShowtimeIdFromBooking: (id: number) => void,
        setShowtimesTime: (time: string) => void
    ) => {
        if (!item.room_id) {
            console.error("room_id is invalid!", item);
            return;
        }

        setRoomIdFromShowtimes(item.room_id);
        setShowtimeIdFromBooking(item.id);
        setShowtimesTime(item.start_time);
    };

    // loading website and get calendar_showtime_id
    useEffect(() => {
        if (LoadShowByFilmAndDate) {
            setCalendarShowtimeID(LoadShowByFilmAndDate.calendar_show_id);
            isLoadingFilmAndDate; // Khi dữ liệu đã có, tắt loading
        }
    }, [LoadShowByFilmAndDate]);

    return (
        <div>
            {isLoadingCalendarMovie ? (
                <Skeleton loading={isLoadingCalendarMovie} active></Skeleton>
            ) : (
                <>
                    <div className={clsx(styles.calendarDays)}>
                        {/* {console.log("check array", calendarMovie)} */}
                        {calendarMovie?.map((item: any, index: any) => {
                            const dayIndex = new Date(item).getDay();
                            const formatted = dayjs(item).format("DD/MM");
                            const rawFormat = dayjs(item).format("YYYY-MM-DD");

                            return (
                                <BoxDay
                                    key={index}
                                    searchDate={searchDateFormatted}
                                    date={formatted}
                                    number={daysOfWeek[dayIndex]}
                                    onClick={() => {
                                        setSearchDateRaw(rawFormat);
                                        setSearchDateFormatted(formatted);
                                        setShowtimesDate(formatted);
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div className={clsx(styles.filmRoom)}>Phòng chiếu</div>
                    {isLoadingFilmAndDate ? (
                        <div className={clsx(styles.loadingTime)}>
                            <Spin />
                        </div>
                    ) : (
                        <div className={clsx(styles.calendarNumbers)}>
                            {LoadShowByFilmAndDate &&
                            LoadShowByFilmAndDate.length > 0 ? (
                                [...LoadShowByFilmAndDate] // Sao chép mảng để tránh thay đổi trực tiếp
                                    .sort(
                                        (a, b) =>
                                            dayjs(
                                                a.start_time,
                                                "HH:mm:ss"
                                            ).unix() -
                                            dayjs(
                                                b.start_time,
                                                "HH:mm:ss"
                                            ).unix()
                                    )
                                    .map((item: any, index: any) => {
                                        const formattedTime = dayjs(
                                            item.start_time,
                                            "HH:mm:ss"
                                        ).format("HH:mm");

                                        return (
                                            <BoxNumbers
                                                key={index}
                                                time={formattedTime}
                                                onClick={() =>
                                                    handleShowtimeClick(
                                                        item,
                                                        setRoomIdFromShowtimes,
                                                        setShowtimeIdFromBooking,
                                                        setShowtimesTime
                                                    )
                                                }
                                            />
                                        );
                                    })
                            ) : (
                                <p className={clsx(styles.noShowtimes)}>
                                    *Chưa có suất chiếu nào cho ngày đã chọn.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CalendarMovies;
