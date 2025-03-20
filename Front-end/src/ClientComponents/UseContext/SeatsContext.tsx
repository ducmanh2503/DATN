import { createContext, useContext, useEffect, useState } from "react";

const SeatsContext = createContext<any>(null);

export const SeatsProvider = ({ children }: { children: React.ReactNode }) => {
    const [quantitySeats, setQuantitySeats] = useState<number | null>(() => {
        const storedQuantitySeats = sessionStorage.getItem("quantitySeats");
        return storedQuantitySeats ? JSON.parse(storedQuantitySeats) : 0;
    }); // tổng số lượng ghế
    const [typeSeats, setTypeSeats] = useState<string[]>(() => {
        const storedTypeSeats = sessionStorage.getItem("typeSeats");
        return storedTypeSeats ? JSON.parse(storedTypeSeats) : [];
    }); // loại ghế
    const [nameSeats, setNameSeats] = useState<string[]>(() => {
        const storedNameSeats = sessionStorage.getItem("nameSeats");
        return storedNameSeats ? JSON.parse(storedNameSeats) : [];
    }); // tên ghế
    const [totalSeatPrice, setTotalSeatPrice] = useState<number | null>(() => {
        const storedTotalSeatPrice = sessionStorage.getItem("totalSeatPrice");
        return storedTotalSeatPrice ? JSON.parse(storedTotalSeatPrice) : 0;
    }); // tổng số tiền ghế
    const [matrixSeatsManage, setMatrixSeatsManage] = useState<string[]>([]); // ma trận ghế
    const [shouldRefetch, setShouldRefetch] = useState(false); // Thêm state để theo dõi trạng thái refetch
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>(() => {
        const storedSelectedSeatIds = sessionStorage.getItem("selectedSeatIds");
        return storedSelectedSeatIds ? JSON.parse(storedSelectedSeatIds) : [];
    }); //  id ghế đã chọn

    // cập nhât sessionStorage khi các state thay đổi
    useEffect(() => {
        sessionStorage.setItem("quantitySeats", JSON.stringify(quantitySeats));
        sessionStorage.setItem("typeSeats", JSON.stringify(typeSeats));
        sessionStorage.setItem("nameSeats", JSON.stringify(nameSeats));
        sessionStorage.setItem(
            "totalSeatPrice",
            JSON.stringify(totalSeatPrice)
        );
        sessionStorage.setItem(
            "selectedSeatIds",
            JSON.stringify(selectedSeatIds)
        );
    }, [quantitySeats, typeSeats, nameSeats, totalSeatPrice, selectedSeatIds]);

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
