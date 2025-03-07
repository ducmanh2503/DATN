import { useQuery } from "@tanstack/react-query";
import BoxDay from "./BoxDays/BoxDay";
import BoxNumbers from "./BoxNumbers/BoxNumbers";
import "./CalendarMovie.css";
import axios from "axios";
import { GET_SHOW_BY_FILM_DATE } from "../../config/ApiConfig";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Skeleton, Spin } from "antd";
import { useMessageContext } from "../UseContext/ContextState";

const CalendarMovies = ({ id, setIsModalOpen2 }: any) => {
    const [searchDateRaw, setSearchDateRaw] = useState<string | null>(null);
    const [searchDateFormatted, setSearchDateFormatted] = useState<
        string | null
    >(null);
    const { setShowtimesTime, setShowtimesDate } = useMessageContext();

    //lấy các ngày trong lịch chiếu của phim
    const { data: calendarMovie, isLoading: isLoadingCalendarMovie } = useQuery(
        {
            queryKey: ["calendarMovie", id],
            queryFn: async () => {
                const { data } = await axios.get(
                    `http://localhost:8000/api/calendar-show/date-range/${id}`
                );
                console.log("check-calendar", data.show_dates);

                return data.show_dates;
            },
            staleTime: 1000 * 60 * 10,
            enabled: setIsModalOpen2,
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
            queryKey: ["LoadShowByFilmAndDate", searchDateRaw],
            queryFn: async () => {
                if (!searchDateRaw) return null;
                const { data } = await axios.get(
                    `${GET_SHOW_BY_FILM_DATE}?date=${searchDateRaw}`
                );
                return data;
            },
            enabled: !!searchDateRaw, // Chỉ gọi API khi có ngày hợp lệ
            staleTime: 1000 * 60,
        });

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

    // loading website
    useEffect(() => {
        if (LoadShowByFilmAndDate) {
            isLoadingFilmAndDate; // Khi dữ liệu đã có, tắt loading
        }
    }, [LoadShowByFilmAndDate]);

    // lấy room
    // const { data: getNameRooms } = useQuery({
    //     queryKey: ["getNameRooms"],
    //     queryFn: async () => {
    //         const { data } = await axios.get(GET_ROOMS);
    //         console.log(data.rooms);

    //         return data.rooms.map((item: any) => ({
    //             ...item,
    //             key: item.id,
    //         }));
    //     },
    // });
    return (
        <div>
            {isLoadingCalendarMovie ? (
                <Skeleton loading={isLoadingCalendarMovie} active></Skeleton>
            ) : (
                <>
                    <div className="calendar-days">
                        {console.log("check array", calendarMovie)}
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
                    <div className="film-room">Phòng chiếu</div>
                    {isLoadingFilmAndDate ? (
                        <div className="loading-time">
                            <Spin />
                        </div>
                    ) : (
                        <div className="calendar-numbers">
                            {LoadShowByFilmAndDate &&
                            LoadShowByFilmAndDate.length > 0 ? (
                                LoadShowByFilmAndDate.map(
                                    (item: any, index: any) => {
                                        const formattedTime = dayjs(
                                            item.start_time,
                                            "HH:mm:ss"
                                        ).format("HH:mm");
                                        return (
                                            <BoxNumbers
                                                key={index}
                                                time={formattedTime}
                                                onClick={() =>
                                                    setShowtimesTime(
                                                        formattedTime
                                                    )
                                                }
                                            />
                                        );
                                    }
                                )
                            ) : (
                                <p className="no-showtimes">
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
