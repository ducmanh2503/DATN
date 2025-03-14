import { Divider } from "antd";
import clsx from "clsx";
import styles from "../InfoMovie/InfoMovie.module.css";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useEffect } from "react";
import { useComboContext } from "../../UseContext/CombosContext";
import { useStepsContext } from "../../UseContext/StepsContext";
import { useFinalPriceContext } from "../../UseContext/FinalPriceContext";

const SeatInfo = () => {
    const { typeSeats, setTotalSeatPrice } = useSeatsContext();
    const { totalComboPrice } = useComboContext();
    const { currentStep } = useStepsContext();
    const { totalPrice } = useFinalPriceContext();
    useEffect(() => {
        const newTotalSeatsPrice = typeSeats.reduce(
            (sum: number, seat: any) => {
                const price = Number(seat.price) || 0;
                return sum + price;
            },
            0
        );

        // if (totalComboPrice && currentStep === 1) {
        //     console.log("check- back", totalPrice);

        //     setTotalSeatPrice(totalPrice);
        // } else {
        //     setTotalSeatPrice(newTotalSeatsPrice);
        // }
        setTotalSeatPrice(newTotalSeatsPrice);
    }, [typeSeats, totalComboPrice, currentStep]);

    return (
        <div>
            <Divider className={clsx(styles.dividerCustom)} dashed />
            <div className={clsx(styles.bookingSeats)}>
                {typeSeats.map((seats: any, index: any) => (
                    <div className={clsx(styles.seatItem)} key={index}>
                        <div className={clsx(styles.seatInfo)}>
                            <div className={clsx(styles.seatCount)}>
                                <span className={clsx(styles.number)}>
                                    {seats.quantitySeats === 0
                                        ? ""
                                        : `${seats.quantitySeats} x `}
                                </span>
                                <span className={clsx(styles.seatType)}>
                                    Ghế {seats.type}
                                </span>
                            </div>
                            <span className={clsx(styles.seatNumbers)}>
                                <span>Ghế:</span>
                                <span className={clsx(styles.seatName)}>
                                    {seats.seatCode}
                                </span>
                            </span>
                        </div>
                        <div className={clsx(styles.seatPrice)}>
                            {seats.price}đ
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeatInfo;
