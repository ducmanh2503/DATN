import { Modal } from "antd";
import { useMessageContext } from "../../UseContext/ContextState";
import styles from "./DetailBooking.module.css";
import dayjs from "dayjs";
import clsx from "clsx";

const DetailBooking = ({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) => {
    const {
        dataDetailFilm,
        nameSeats,
        showtimesTime,
        showtimesDate,
        totalPrice,
    } = useMessageContext();
    return (
        <Modal
            centered
            open={open}
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
            footer={null}
            width={400}
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
        </Modal>
    );
};

export default DetailBooking;
