import { useQuery } from "@tanstack/react-query";
import BoxDay from "./BoxDays/BoxDay";
import BoxNumbers from "./BoxNumbers/BoxNumbers";
import "./CalendarMovie.css";
import axios from "axios";
import { GET_DATES_BY_CALENDAR } from "../../config/ApiConfig";
import { useEffect, useState } from "react";

const CalendarMovies = ({ id, setIsModalOpen2 }: any) => {
    const [calendarShowtimesId, setCalendarShowtimesId] = useState<
        number | null
    >(null);

    const { data: calendarMovie } = useQuery({
        queryKey: ["calendarMovie", id],
        queryFn: async () => {
            const { data } = await axios.get(
                `http://localhost:8000/api/calendar-show/movie/${id}`
            );
            console.log("calendar", data);
            // console.log("calendar-2", calendarMovie);

            return data;
        },
        // enabled: setIsModalOpen2,
    });

    useEffect(() => {
        // console.log("checkkk", calendarMovie);

        if (calendarMovie?.id) {
            setCalendarShowtimesId(calendarMovie.id);
        }
    }, [calendarMovie]);

    const { data: datesByCalendar } = useQuery({
        queryKey: ["datesByCalendar", calendarShowtimesId],
        queryFn: async () => {
            if (!calendarShowtimesId) return []; // Nếu `calendarShowtimesId` null, không gọi API
            const { data } = await axios.post(GET_DATES_BY_CALENDAR, {
                calendar_show_id: calendarShowtimesId,
            });
            console.log("days-by-calendar", data);
            return data.dates;
        },
        enabled: !!calendarShowtimesId, // API chỉ chạy khi có `calendarShowtimesId`
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
};

export default CalendarMovies;
