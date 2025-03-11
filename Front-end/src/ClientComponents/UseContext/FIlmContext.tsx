// import { createContext, useContext, useState } from "react";

// const FilmContext = createContext<any>(null);

// export const FilmsProvider = ({ children }: { children: React.ReactNode }) => {
//     const [filmId, setFilmId] = useState<number | null>(null); // id phim
//     const [showtimesTime, setShowtimesTime] = useState<string | null>(null); // thời gian suất chiếu
//     const [showtimesDate, setShowtimesDate] = useState<string | null>(null); // ngày suất chiếu
//     const [roomIdFromShowtimes, setRoomIdFromShowtimes] = useState<
//         number | null
//     >(); // id room_id booking
//     const [showtimeIdFromBooking, setShowtimeIdFromBooking] = useState<
//         number | null
//     >(); // id suất chiếu booking

//     const [shouldRefetch, setShouldRefetch] = useState(false); // Thêm state để theo dõi trạng thái refetch
//     const [userIdFromShowtimes, setUserIdFromShowtimes] = useState<
//         number | null
//     >(0); // user ID showtimes
//     const [seats, setSeats] = useState<
//         Record<string, { isHeld?: boolean; heldByUser?: boolean }>
//     >({}); // ghế đã chọn trong showtimes
//     const [matrixSeatsManage, setMatrixSeatsManage] = useState<string[]>([]); //
//     const [totalPrice, setTotalPrice] = useState<number | null>(null); // tổng tiền mua vé
//     const [currentStep, setCurrentStep] = useState(1); // step payment
//     return (
//         <FilmContext.Provider
//             value={{
//                 filmId,
//                 setFilmId,
//                 showtimesTime,
//                 setShowtimesTime,
//                 showtimesDate,
//                 setShowtimesDate,
//                 currentStep,
//                 setCurrentStep,
//                 totalPrice,
//                 setTotalPrice,
//                 roomIdFromShowtimes,
//                 setRoomIdFromShowtimes,
//                 showtimeIdFromBooking,
//                 setShowtimeIdFromBooking,
//                 shouldRefetch,
//                 setShouldRefetch,
//                 userIdFromShowtimes,
//                 setUserIdFromShowtimes,
//                 seats,
//                 setSeats,
//                 matrixSeatsManage,
//                 setMatrixSeatsManage,
//             }}
//         >
//             {children}
//         </FilmContext.Provider>
//     );
// };

// export const useFilmContext = () => {
//     return useContext(FilmContext);
// };
