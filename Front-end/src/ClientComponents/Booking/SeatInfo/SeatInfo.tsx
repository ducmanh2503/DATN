import { Divider } from "antd";
import clsx from "clsx";
import styles from "../InfoMovie/InfoMovie.module.css";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useEffect } from "react";

const SeatInfo = () => {
    const {
        quantitySeats,
        typeSeats,
        nameSeats,
        totalSeatPrice,
        setTotalSeatPrice,
    } = useSeatsContext();
    useEffect(() => {
        console.log("check type ghế", typeSeats);

        const newTotalSeatsPrice = typeSeats.length
            ? typeSeats.reduce(
                  (sum: any, seat: any) =>
                      sum + seat.quantitySeats * seat.price,
                  0
              )
            : 0;

        setTotalSeatPrice(newTotalSeatsPrice);
        console.log(totalSeatPrice);
    }, [typeSeats, totalSeatPrice]);

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
                            {seats.quantitySeats * seats.price}đ
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeatInfo;
