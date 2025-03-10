import React, { useEffect, useState } from "react";
import "../BookingInfo/BookingInfo.css";
import { useNavigate } from "react-router-dom";
const SeatHoldTime = () => {
    const [timeLeft, setTimeLeft] = useState(420); //  giây
    const [isTimeUp, setIsTimeUp] = useState(false); // State để kiểm tra hết giờ chưa
    const navigate = useNavigate();

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeUp(true); // Cập nhật state khi hết giờ
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(interval); // Dọn dẹp interval khi unmount
    }, [timeLeft]);

    useEffect(() => {
        if (isTimeUp) {
            navigate("/playingFilm");
        }
    }, [isTimeUp, navigate]);
    return (
        <div className="booking-timer">
            Thời gian giữ ghế:
            <span className="timer-countdown">
                {minutes}:{seconds < 10 ? "0" : ""}
                {seconds}
            </span>
        </div>
    );
};

export default SeatHoldTime;
