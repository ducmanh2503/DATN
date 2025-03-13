import { Modal } from "antd";
import styles from "./DetailBooking.module.css";
import dayjs from "dayjs";
import clsx from "clsx";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useStepsContext } from "../../UseContext/StepsContext";
import { useFilmContext } from "../../UseContext/FIlmContext";
import { useFinalPriceContext } from "../../UseContext/FinalPriceContext";
import { useSeatsContext } from "../../UseContext/SeatsContext";
import { useComboContext } from "../../UseContext/CombosContext";

const DetailBooking = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const { dataDetailFilm, calendarShowtimeID } = useStepsContext();
    const { showtimesTime, showtimesDate, filmId, showtimeIdFromBooking } =
        useFilmContext();
    const { totalPrice } = useFinalPriceContext();
    const { nameSeats, totalSeatPrice } = useSeatsContext();
    const { nameCombo, totalComboPrice } = useComboContext();

    const [isSelected, setIsSelected] = useState(false);

    const onOk = () => {
        paymentTicket();
        setOpen(false);
    };

    const onCancel = () => {
        setOpen(false);
        setIsSelected(false);
    };

    const handleClick = () => {
        setIsSelected(!isSelected); // Toggle trạng thái chọn
    };

    const { mutate: paymentTicket } = useMutation({
        mutationFn: async () => {
            const detailTicket = {
                movie_id: filmId,
                showtime_id: showtimeIdFromBooking,
                calendar_show_id: calendarShowtimeID,
                seat_ids: nameSeats,
                combo_ids: nameCombo,
                pricing: {
                    total_ticket_price: totalSeatPrice,
                    total_combo_price: totalComboPrice,
                    total_price: totalPrice,
                },
            };
            console.log(detailTicket);

            await axios.post(
                `http://localhost:8000/api/ticket-details`,
                detailTicket
            );
        },
    });
    return (
        <Modal
            centered
            open={open}
            closable={false}
            onOk={onOk}
            onCancel={onCancel}
            okText="Thanh toán"
            cancelButtonProps={{ style: { display: "none" } }}
            okButtonProps={{
                className: clsx(styles.customOkButton),
                disabled: !isSelected, // Chỉ cho phép bấm nếu đã chọn
            }}
            width={385}
        >
            <div className={clsx(styles.infoBox)}>
                <h1 className={clsx(styles.info)}>THÔNG TIN ĐẶT VÉ</h1>
                <div className={clsx(styles.movieInfo)}>
                    <h2 className={clsx(styles.sectionTitle)}>Phim</h2>
                    <div className={clsx(styles.subBox)}>
                        <h3 className={clsx(styles.movieTitle)}>
                            {dataDetailFilm?.title}
                        </h3>
                        <div className={clsx(styles.movieDetails)}>
                            <span className={clsx(styles.format)}>2D</span>
                            {"  "}
                            <span className={clsx(styles.language)}>
                                {dataDetailFilm?.language}
                            </span>
                            <span className={clsx(styles.rated)}>
                                {dataDetailFilm?.rated}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.bookingContent)}>
                    <h2 className={clsx(styles.sectionTitle)}>Nội dung</h2>
                    <div className={clsx(styles.ticketDetails)}>
                        <div className={clsx(styles.cinemaRoom)}>RAP 2</div>
                        <div className={clsx(styles.showtime)}>
                            {dayjs(showtimesTime, "HH:mm:ss").format("HH:mm")} -{" "}
                            {dayjs(showtimesDate, "MM/DD").format("MM/DD")}
                        </div>
                        <div className={clsx(styles.seatInfo)}>
                            <span className={clsx(styles.seatLabel)}>
                                Ghế:{" "}
                            </span>
                            <span className={clsx(styles.seatName)}>
                                {nameSeats.join(",")}
                            </span>
                        </div>
                        <div className={clsx(styles.comboInfo)}>
                            <span>1</span> x <span>Gói Combo đầu tiên</span>
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.allInfo)}>
                    <h2 className={clsx(styles.all)}>Tổng</h2>
                    <div className={clsx(styles.totalPrice)}>
                        {totalPrice} VNĐ
                    </div>
                </div>
            </div>
            <div className={clsx(styles.checked)}>
                <span className={clsx(styles.paragraph)}>
                    Tôi xác nhận thông tin đặt vé là chính xác
                </span>{" "}
                <span
                    className={clsx(styles.selectButton, {
                        [styles.active]: isSelected,
                    })}
                    onClick={handleClick}
                ></span>
            </div>
        </Modal>
    );
};
export default DetailBooking;
