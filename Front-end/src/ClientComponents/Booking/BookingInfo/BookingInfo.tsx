import { useMessageContext } from "../../UseContext/ContextState";
import InfoMovie from "../InfoMovie/InfoMovie";
import SeatHoldTime from "../SeatHoldTime/SeatHoldTime";
import clsx from "clsx";
import styles from "./BookingInfo.module.css";
const BookingInfo = ({ nextStep, prevStep, className }: any) => {
    const { currentStep } = useMessageContext();
    return (
        <div
            className={clsx(styles.bookingInfo, className)}
            style={currentStep === 1 ? { marginTop: "20px" } : {}}
        >
            {currentStep !== 1 ? <SeatHoldTime></SeatHoldTime> : ""}
            <InfoMovie></InfoMovie>
            <div className={clsx(styles.bookingActions)}>
                <button
                    className={clsx(styles.btnBack, styles.btnLink)}
                    onClick={prevStep}
                >
                    Quay lại
                </button>
                <button
                    className={clsx(styles.btnNext, styles.btnLink)}
                    onClick={nextStep}
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

export default BookingInfo;
