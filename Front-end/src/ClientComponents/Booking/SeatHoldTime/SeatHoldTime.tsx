import React from "react";
import "../BookingInfo/BookingInfo.css";
const SeatHoldTime = () => {
    return (
        <div className="booking-timer">
            Thời gian giữ ghế:
            <span className="timer-countdown">10:00</span>
        </div>
    );
};

export default SeatHoldTime;
