import { createContext, useContext, useState } from "react";

const SeatsContext = createContext<any>(null);

export const SeatsProvider = ({ children }: { children: React.ReactNode }) => {
    const [quantitySeats, setQuantitySeats] = useState<number | null>(0); // tổng số lượng ghế
    const [typeSeats, setTypeSeats] = useState<string[]>([]); // loại ghế
    const [nameSeats, setNameSeats] = useState<string[]>([]); // tên ghế
    const [totalSeatPrice, setTotalSeatPrice] = useState<number | null>(0); // tổng số tiền ghế
    const [matrixSeatsManage, setMatrixSeatsManage] = useState<string[]>([]); // ma trận ghế
    const [seats, setSeats] = useState<
        Record<string, { isHeld?: boolean; heldByUser?: boolean }>
    >({}); // ghế đã chọn trong showtimes
    const [shouldRefetch, setShouldRefetch] = useState(false); // Thêm state để theo dõi trạng thái refetch
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]); //  id ghế đã chọn

    return (
        <SeatsContext.Provider
            value={{
                quantitySeats,
                setQuantitySeats,
                typeSeats,
                setTypeSeats,
                nameSeats,
                setNameSeats,
                totalSeatPrice,
                setTotalSeatPrice,
                matrixSeatsManage,
                setMatrixSeatsManage,
                seats,
                setSeats,
                shouldRefetch,
                setShouldRefetch,
                selectedSeatIds,
                setSelectedSeatIds,
            }}
        >
            {children}
        </SeatsContext.Provider>
    );
};

export const useSeatsContext = () => {
    return useContext(SeatsContext);
};
