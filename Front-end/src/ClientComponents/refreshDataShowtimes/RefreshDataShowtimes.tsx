import { useComboContext } from "../UseContext/CombosContext";
import { useFinalPriceContext } from "../UseContext/FinalPriceContext";
import { useSeatsContext } from "../UseContext/SeatsContext";

const useShowtimeData = () => {
    const {
        setQuantityCombo,
        setNameCombo,
        setTotalComboPrice,
        setQuantityMap,
    } = useComboContext();
    const { setTypeSeats, setNameSeats, setTotalSeatPrice, setQuantitySeats } =
        useSeatsContext();
    const { setTotalPrice } = useFinalPriceContext();

    // Hàm reset dữ liệu
    const resetDataShowtimes = () => {
        setQuantitySeats(0);
        setTypeSeats(null);
        setNameSeats([]);
        setTotalSeatPrice(0);
        setQuantityCombo(0);
        setNameCombo([]);
        setTotalComboPrice(0);
        setQuantityMap({});
        setTotalPrice(0);
    };
    return {
        setQuantityCombo,
        setNameCombo,
        setTotalComboPrice,
        setQuantityMap,
        setTypeSeats,
        setNameSeats,
        setTotalSeatPrice,
        setQuantitySeats,
        setTotalPrice,
        resetDataShowtimes,
    };
};

export default useShowtimeData;
