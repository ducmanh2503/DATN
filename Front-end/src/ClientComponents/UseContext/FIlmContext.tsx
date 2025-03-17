import { createContext, useContext, useState } from "react";

const FilmContext = createContext<any>(null);

export const FilmsProvider = ({ children }: { children: React.ReactNode }) => {
    const [filmId, setFilmId] = useState<number | null>(null); // id phim
    const [showtimesTime, setShowtimesTime] = useState<string | null>(null); // thời gian suất chiếu
    const [showtimesDate, setShowtimesDate] = useState<string | null>(""); // ngày suất chiếu
    const [roomIdFromShowtimes, setRoomIdFromShowtimes] = useState<
        number | null
    >(); // id room_id booking
    const [showtimeIdFromBooking, setShowtimeIdFromBooking] = useState<
        number | null
    >(); // id suất chiếu booking
    const [listShowtimes, setListShowtimes] = useState<any[]>([]); // danh sách suất chiếu
    return (
        <FilmContext.Provider
            value={{
                filmId,
                setFilmId,
                showtimesTime,
                setShowtimesTime,
                showtimesDate,
                setShowtimesDate,
                roomIdFromShowtimes,
                setRoomIdFromShowtimes,
                showtimeIdFromBooking,
                setShowtimeIdFromBooking,
                listShowtimes,
                setListShowtimes,
            }}
        >
            {children}
        </FilmContext.Provider>
    );
};

export const useFilmContext = () => {
    return useContext(FilmContext);
};
