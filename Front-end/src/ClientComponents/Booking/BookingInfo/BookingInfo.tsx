import InfoMovie from "../InfoMovie/InfoMovie";
import "./BookingInfo.css";
const BookingInfo = ({ nextStep, prevStep, className }: any) => {
    return (
        <div className={`booking-info ${className}`}>
            <div className="booking-timer">
                Thời gian giữ ghế:
                <span className="timer-countdown">10:00</span>
            </div>
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
