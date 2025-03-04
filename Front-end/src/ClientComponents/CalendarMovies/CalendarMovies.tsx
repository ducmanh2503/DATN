import { useQuery } from "@tanstack/react-query";
import BoxDay from "./BoxDays/BoxDay";
import BoxNumbers from "./BoxNumbers/BoxNumbers";
import "./CalendarMovie.css";
import axios from "axios";
import { DETAIL_CALENDAR, GET_DATES_BY_CALENDAR } from "../../config/ApiConfig";
import { useState } from "react";
const CalendarMovies = ({ id, setIsModalOpen2 }: any) => {
    const [calendarShowtimesId, setCalendarShowtimesId] = useState<
        number | null
    >(null);
    const { data: calendarMovie } = useQuery({
        queryKey: ["calendarMovie", id],
        queryFn: async () => {
            const { data } = await axios.get(DETAIL_CALENDAR(id));
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
};

export default CalendarMovies;
