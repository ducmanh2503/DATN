// import { createContext, useContext, useState } from "react";

// const SeatsContext = createContext<any>(null);

// export const SeatsProvider = ({ children }: { children: React.ReactNode }) => {
//     const [quantitySeats, setQuantitySeats] = useState<number | null>(0); // tổng số lượng ghế
//     const [typeSeats, setTypeSeats] = useState<string | null>(null); // loại ghế
//     const [nameSeats, setNameSeats] = useState<string[]>([]); // tên ghế
//     const [totalSeatPrice, setTotalSeatPrice] = useState<number | null>(0); // tổng số tiền ghế
//     const [holdSeatId, setHoldSeatId] = useState<string[]>([]); // id của hold-seat
//     const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]); //  id ghế đã chọn

//     return (
//         <SeatsContext.Provider
//             value={{
//                 quantitySeats,
//                 setQuantitySeats,
//                 typeSeats,
//                 setTypeSeats,
//                 nameSeats,
//                 setNameSeats,
//                 totalSeatPrice,
//                 setTotalSeatPrice,
//                 holdSeatId,
//                 setHoldSeatId,
//                 selectedSeatIds,
//                 setSelectedSeatIds,
//             }}
//         >
//             {children}
//         </SeatsContext.Provider>
//     );
// };

// export const useSeatsContext = () => {
//     return useContext(SeatsContext);
// };
