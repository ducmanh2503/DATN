import { createContext, useContext, useState } from "react";

const MessageContext = createContext<any>(null);

export const MessageProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [filmId, setFilmId] = useState<number | null>(null); // id phim
    const [showtimesTime, setShowtimesTime] = useState<string | null>(null); // thời gian suất chiếu
    const [showtimesDate, setShowtimesDate] = useState<string | null>(null); // ngày suất chiếu
    const [currentStep, setCurrentStep] = useState(1); // step payment
    const [quantitySeats, setQuantitySeats] = useState<number | null>(0); // tổng số lượng ghế
    const [typeSeats, setTypeSeats] = useState<string | null>(null); // loại ghế
    const [nameSeats, setNameSeats] = useState<string[]>([]); // tên ghế
    const [totalSeatPrice, setTotalSeatPrice] = useState<number | null>(0); // tổng số tiền ghế
    const [quantityCombo, setQuantityCombo] = useState<number | null>(0); // tổng số lượng combo
    const [nameCombo, setNameCombo] = useState([]); // tên combo
    const [totalComboPrice, setTotalComboPrice] = useState<string | null>(null); // tổng số tiền combo
    const [totalPrice, setTotalPrice] = useState<number | null>(null); // tổng tiền mua vé

    return (
        <MessageContext.Provider
            value={{
                filmId,
                setFilmId,
                showtimesTime,
                setShowtimesTime,
                showtimesDate,
                setShowtimesDate,
                currentStep,
                setCurrentStep,
                quantitySeats,
                setQuantitySeats,
                typeSeats,
                setTypeSeats,
                nameSeats,
                setNameSeats,
                totalSeatPrice,
                setTotalSeatPrice,
                quantityCombo,
                setQuantityCombo,
                nameCombo,
                setNameCombo,
                totalComboPrice,
                setTotalComboPrice,
                totalPrice,
                setTotalPrice,
            }}
        >
            {children}
        </MessageContext.Provider>
    );
};

export const useMessageContext = () => {
    return useContext(MessageContext);
};
