import InfoMovie from "../InfoMovie/InfoMovie";
import SeatHoldTime from "../SeatHoldTime/SeatHoldTime";
import clsx from "clsx";
import styles from "./BookingInfo.module.css";
import { useMessageContext } from "../../UseContext/ContextState";
import { useState } from "react";
import DetailBooking from "../DetailBooking/DetailBooking";
const BookingInfo = ({ nextStep, prevStep, className }: any) => {
    const { currentStep } = useMessageContext();
    const [open, setOpen] = useState(false);

    return (
        <>
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
                        onClick={() => {
                            if (currentStep === 3) {
                                setOpen(true);
                                return;
                            }
                            nextStep();
                        }}
                    >
                        {currentStep === 3 ? "Thanh toán" : "Tiếp tục"}
                    </button>
                </div>
            </div>
            <DetailBooking open={open} setOpen={setOpen} />
        </>
    );
};

export default BookingInfo;
