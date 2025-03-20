import { useQuery } from "@tanstack/react-query";
import BoxDay from "./BoxDays/BoxDay";
<<<<<<< HEAD
import BoxNumbers from "./BoxNumbers/BoxNumbers";
import "./CalendarMovie.css";
import axios from "axios";
import { DETAIL_CALENDAR, GET_DATES_BY_CALENDAR } from "../../config/ApiConfig";
import { useState } from "react";
const CalendarMovies = ({ id, setIsModalOpen2 }: any) => {
  const [calendarShowtimesId, setCalendarShowtimesId] = useState<number | null>(
    null
  );
  const { data: calendarMovie } = useQuery({
    queryKey: ["calendarMovie", id],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:8000/api/calendar-show/movie/${id}`
      );
      console.log("calendar", data);
      setCalendarShowtimesId(data.id);
      return data;
    },
    // enabled: setIsModalOpen2,
  });

  const { data: datesByCalendar } = useQuery({
    queryKey: ["datesByCalendar", calendarShowtimesId],
    queryFn: async () => {
      if (!calendarShowtimesId) return [];
      const { data } = await axios.post(GET_DATES_BY_CALENDAR, {
        calendar_show_id: calendarShowtimesId,
      });
      console.log("days-by-calendar", data);
      return data.dates;
    },
    // enabled: !!calendarShowtimesId,
  });

  return (
    <div>
      <div className="calendar-days">
        <BoxDay></BoxDay>
        <BoxDay></BoxDay>
        <BoxDay></BoxDay>
        <BoxDay></BoxDay>
        <BoxDay></BoxDay>
        <BoxDay></BoxDay>
        <BoxDay></BoxDay>
      </div>
      <div className="film-room">Phòng chiếu</div>
      <div className="calendar-numbers">
        <BoxNumbers></BoxNumbers>
        <BoxNumbers></BoxNumbers>
        <BoxNumbers></BoxNumbers>
        <BoxNumbers></BoxNumbers>
        <BoxNumbers></BoxNumbers>
      </div>
    </div>
  );
=======
import styles from "./CalendarMovie.module.css";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useStepsContext } from "../UseContext/StepsContext";

const CalendarMovies = ({ id, setIsModalOpen2 }: any) => {
    const [searchDateRaw, setSearchDateRaw] = useState<string | null>(null);
    const [searchDateFormatted, setSearchDateFormatted] = useState<
        string | null
    >(null);
    const { setCalendarShowtimeID } = useStepsContext();
    const {
        setShowtimesTime,
        setShowtimesDate,
        setRoomIdFromShowtimes,
        setShowtimeIdFromBooking,
        setListShowtimes,
    } = useFilmContext();

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
                console.log("test-data", data.show_times);

                return data.show_times;
            },
            enabled: !!searchDateRaw, // Chỉ gọi API khi có ngày hợp lệ
            staleTime: 1000 * 60,
            retry: false,
        });

    //lưu các suất chiếu vào state
    useEffect(() => {
        if (LoadShowByFilmAndDate) {
            setListShowtimes(LoadShowByFilmAndDate);
        }
    }, [LoadShowByFilmAndDate]);

    // format dữ liệu
    useEffect(() => {
        if (calendarMovie && calendarMovie.length > 0) {
            const firstDate = dayjs(calendarMovie[0]).format("YYYY-MM-DD");
            console.log("First date from API:", firstDate);
            // Chỉ cập nhật nếu khác giá trị hiện tại
            if (searchDateRaw !== firstDate) {
                setSearchDateRaw(firstDate);
                setSearchDateFormatted(dayjs(firstDate).format("DD/MM"));
                setShowtimesDate(dayjs(firstDate).format("DD/MM"));
            }
        }
    }, [calendarMovie, id]);

    const handleShowtimeClick = (
        item: any,
        setCalendarShowtimeID: (id: number) => void,
        setRoomIdFromShowtimes: (id: number) => void,
        setShowtimeIdFromBooking: (id: number) => void,
        setShowtimesTime: (time: string) => void
    ) => {
        if (!item.room_id) {
            console.error("room_id is invalid!", item);
            return;
        }

        setCalendarShowtimeID(item.calendar_show_id);
        setRoomIdFromShowtimes(item.room_id);
        setShowtimeIdFromBooking(item.id);
        setShowtimesTime(item.start_time);
    };

    // loading website and get calendar_showtime_id
    useEffect(() => {
        if (LoadShowByFilmAndDate) {
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
                                                        setCalendarShowtimeID,
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
>>>>>>> main
};

export default CalendarMovies;
