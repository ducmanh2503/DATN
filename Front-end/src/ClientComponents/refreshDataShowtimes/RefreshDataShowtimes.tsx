import { useMutation } from "@tanstack/react-query";
import { useComboContext } from "../UseContext/CombosContext";
import { useFinalPriceContext } from "../UseContext/FinalPriceContext";
import { useSeatsContext } from "../UseContext/SeatsContext";
import { useStepsContext } from "../UseContext/StepsContext";
import axios from "axios";
import { useFilmContext } from "../UseContext/FIlmContext";
import { useAuthContext } from "../UseContext/TokenContext";

const useShowtimeData = () => {
    const {
        setQuantityCombo,
        setNameCombo,
        setTotalComboPrice,
        setQuantityMap,
        setHoldComboID,
    } = useComboContext();
    const {
        setTypeSeats,
        setNameSeats,
        setTotalSeatPrice,
        setQuantitySeats,
        setSeats,
        selectedSeatIds,
        setSelectedSeatIds,
    } = useSeatsContext();
    const { setTotalPrice } = useFinalPriceContext();
    const { setCurrentStep, setCalendarShowtimeID } = useStepsContext();
    const { roomIdFromShowtimes, showtimeIdFromBooking, setShowtimesDate } =
        useFilmContext();
    const { tokenUserId } = useAuthContext();
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
        setCurrentStep(1);
        setHoldComboID([]);
        setSelectedSeatIds([]);
        setCalendarShowtimeID(null);
        // setShowtimesDate("");
    };

    //giải phóng ghế
    const releaseSeatsMutation = useMutation({
        mutationFn: async (seatIds: number[]) => {
            await axios.post(
                `http://localhost:8000/api/release-seats`, // API hủy ghế
                {
                    seats: seatIds,
                    room_id: roomIdFromShowtimes,
                    showtime_id: showtimeIdFromBooking,
                },
                { headers: { Authorization: `Bearer ${tokenUserId}` } }
            );
        },
        onSuccess: () => {
            // Chỉ cập nhật lại ghế đã giải phóng, giữ nguyên ghế đang chọn

            setSeats((prevSeats: any) => {
                const updatedSeats = { ...prevSeats };

                return updatedSeats;
            });
        },
    });
    const releaseSeats = () => {
        if (selectedSeatIds.length > 0) {
            releaseSeatsMutation.mutate(selectedSeatIds);
        }
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
        setCurrentStep,
        setSelectedSeatIds,
        resetDataShowtimes,
        releaseSeats,
    };
};

export default useShowtimeData;
