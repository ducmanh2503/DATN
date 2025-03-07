import { useMessageContext } from "../../UseContext/ContextState";
import InfoMovie from "../InfoMovie/InfoMovie";
import SeatHoldTime from "../SeatHoldTime/SeatHoldTime";
import "./BookingInfo.css";
const BookingInfo = ({ nextStep, prevStep, className }: any) => {
    const { currentStep } = useMessageContext();
    return (
        <div
            className={`booking-info ${className}`}
            style={currentStep === 1 ? { marginTop: "20px" } : {}}
        >
            {currentStep !== 1 ? <SeatHoldTime></SeatHoldTime> : ""}
            <InfoMovie></InfoMovie>
            <div className="booking-actions">
                <button className="btn-back btn-link" onClick={prevStep}>
                    Quay lại
                </button>
                <button className="btn-next btn-link" onClick={nextStep}>
                    Tiếp tục
                </button>
            </div>
        </div>
    );
};

export default BookingInfo;
