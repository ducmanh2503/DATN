import InfoMovie from "../InfoMovie/InfoMovie";
import SeatHoldTime from "../SeatHoldTime/SeatHoldTime";
import clsx from "clsx";
import styles from "./BookingInfo.module.css";
import { useEffect, useState } from "react";
import DetailBooking from "../DetailBooking/DetailBooking";
import { useStepsContext } from "../../UseContext/StepsContext";
const BookingInfo = ({ nextStep, prevStep, className }: any) => {
    const { currentStep, paymentType } = useStepsContext();
    const [open, setOpen] = useState(false);
    // console.log("check-type", paymentType);
    const [error, setError] = useState(false); // State để kiểm soát lỗi

    // Reset lỗi khi quay lại bước trước (step < 3)
    useEffect(() => {
        if (currentStep < 3) {
            setError(false); // Ẩn thông báo lỗi
        }
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep === 3) {
            if (!paymentType) {
                setError(true); // Hiển thị lỗi khi chưa chọn phương thức
                return;
            }
            setOpen(true); // Mở modal khi có paymentType
            return;
        }
        nextStep();
    };
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
                        onClick={handleNext}
                    >
                        {currentStep === 3 ? "Thanh toán" : "Tiếp tục"}
                    </button>
                </div>
                {error && !paymentType && (
                    <span className={clsx(styles.errorMessage)}>
                        * Phải chọn hình thức thanh toán
                    </span>
                )}
            </div>
            <DetailBooking open={open} setOpen={setOpen} />
        </>
    );
};

export default BookingInfo;
