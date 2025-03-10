import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import styles from "../BookingInfo/BookingInfo.module.css";
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
        <div className={clsx(styles.bookingTimer)}>
            Thời gian giữ ghế:
            <span className={clsx(styles.timerCountdown)}>
                {minutes}:{seconds < 10 ? "0" : ""}
                {seconds}
            </span>
        </div>
    );
};

export default SeatHoldTime;
