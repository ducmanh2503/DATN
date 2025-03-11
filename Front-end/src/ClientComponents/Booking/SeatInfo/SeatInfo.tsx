import { Divider } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import clsx from "clsx";
import styles from "../InfoMovie/InfoMovie.module.css";

const SeatInfo = () => {
  const { quantitySeats, typeSeats, nameSeats, totalSeatPrice } =
    useMessageContext();
  return (
    <div>
      <Divider className={clsx(styles.dividerCustom)} dashed />
      <div className={clsx(styles.bookingSeats)}>
        <div className={clsx(styles.seatItem)}>
          <div className={clsx(styles.seatInfo)}>
            <div className={clsx(styles.seatCount)}>
              <span className={clsx(styles.number)}>
                {quantitySeats === 0 ? "" : `${quantitySeats} x`}
              </span>
              <span className={clsx(styles.seatType)}>Ghế đơn{typeSeats}</span>
            </div>
            <span className={clsx(styles.seatNumbers)}>
              <span>Ghế:</span>
              <span className={clsx(styles.seatName)}>
                {nameSeats.join(",")}
              </span>
            </span>
          </div>
          <div className={clsx(styles.seatPrice)}>
            {parseInt(totalSeatPrice)}đ
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatInfo;
